import { OPEN_CLASSNAME, POPUP_CLASSNAME } from "../constants/classnames";
import { CLOSE, ESCAPE, INSERT_AFTER, INSERT_AFTER_LAST_CHILD, OPEN, TAB} from "../constants/globals";
import { createPopover } from "../lib/popover";
import { getElement, insertElement, removeElement, toggleClassName } from "../utils/dom";
import { objectIterator, toArray } from "../utils/object";
import { isString, isset } from "../utils/is";

/**
 * Creates App component and initialize components.
 *
 * @param {Element} root - Picker container.
 * @param {Alwan} alwan - Alwan instance.
 * @returns {object}
 */
export const App = (root, alwan) => {
    /**
     * Popper instance.
     */
    let popoverInstance = null;

    /**
     * Visibility state.
     */
    let isOpen = false;

    /**
     * Setup and Initialize other components.
     *
     * @param {object} options - Alwan options.
     * @param {object} instance - Alwan instance.
     */
    const _setup = (options, instance = alwan) => {
        alwan = instance;
        const { theme, popover, target, position, margin, id, toggle, shared } = options;
        const refElement = alwan._reference._el();
        const targetElement = getElement(target) || refElement;

        if (isString(id) && ! shared) {
            root.id = id;
        }

        // Initialize components.
        objectIterator(alwan._components, ({ _init }) => {
            if (_init) {
                _init(options, alwan);
            }
        })

        // Set theme (dark or light).
        root.dataset.theme = theme;

        // If toggle option changed to false, then open (show) the picker
        if (! toggle && ! shared) {
            _toggle(alwan, true, true);
        }

        // Hide reference element if both toggle and popover options are set to false,
        // and the components are not shared.
        refElement.style.display = popover || toggle || shared ? '' : 'none';

        // Toggle popup class that makes the root's position fixed.
        toggleClassName(root, POPUP_CLASSNAME, popover);

        if (popoverInstance) {
            popoverInstance._destroy();
            popoverInstance = null;
        }

        if (popover) {
            popoverInstance = createPopover(
                targetElement,
                root,
                {
                    _margin: margin,
                    _position: position
                },
                autoUpdate,
                popoverAccessibility
            );
        } else {
            // If there is a target element then append the color picker widget in it,
            // otherwise insert it after the reference element.
            insertElement(
                root,
                targetElement,
                targetElement === refElement ? INSERT_AFTER : INSERT_AFTER_LAST_CHILD
            )
        }
    }

    /**
     * Auto updates popover position and picker visibility.
     *
     * @param {Function} update - Popover position updater function.
     * @param {Function} isInViewport - Checks if popover target element is visible in the viewport.
     */
    const autoUpdate = (update, isInViewport) => {
        if (isOpen || ! alwan.config.toggle) {
            if (isInViewport()) {
                if (isOpen) {
                    // Update popover position if its target element is in the viewport,
                    // and picker is open.
                    update();
                } else {
                    // This is reachable only if toggle is false,
                    // open picker if the popover target element becomes visible.
                    _toggle(alwan, true, true);
                }
            } else {
                // Force close picker if the target element is not in the viewport.
                _toggle(alwan, false, true);
            }
        }
    }

    /**
     * Handles keyboard accessibility.
     *
     * If picker is displayed as a popover then link the focus from the reference,
     * to the picker focusable elements.
     *
     * @param {KeyboardEvent | PointerEvent} e - Event.
     */
    const popoverAccessibility = (e) => {
        if (isOpen) {
            let { target, key, shiftKey } = e;
            let refElement = alwan._reference._el();
            let focusableElements,
                firstFocusableElement,
                lastFocusableElement,
                elementToFocusOn;

            // Close picker if:
            // - Escape key is pressed.
            // - A pointerdown event happened outside the picker and not on the reference element
            // or one of its labels (if it has any).
            if (
                key === ESCAPE ||
                (target !== refElement && !root.contains(target) && ! toArray(refElement.labels || []).some((label) => label.contains(target)))
            ) {
                _toggle(alwan, false);
            } else if (key === TAB) {
                focusableElements = toArray(getElement('button,input,[tabindex]', root, true));
                firstFocusableElement = focusableElements[0];
                lastFocusableElement = focusableElements.pop();

                if (target === refElement && !shiftKey) {
                    // Pressing Tab while focusing on the reference element sends focus,
                    // to the first element (palette) inside the picker container.
                    elementToFocusOn = firstFocusableElement;
                } else if ((shiftKey && target === firstFocusableElement) || (!shiftKey && target === lastFocusableElement)) {
                    // Pressing Tab while focusing on the palette with the shift key or focussing on the last,
                    // focusable element without shift key sends focus to the reference element (if it's focusable).
                    elementToFocusOn = refElement;
                }

                if (elementToFocusOn) {
                    e.preventDefault();
                    elementToFocusOn.focus();
                }
            }
        }
    }

    /**
     * Toggles color picker visibility.
     *
     * @param {object} instance - Alwan instance.
     * @param {boolean} state - True to open, false to close.
     * @param {boolean} forced - Open/Close picker even if its disabled or the toggle option is set to false.
     */
    const _toggle = (instance, state, forced) => {
        instance = instance || alwan;
        let { shared, toggle, disabled } = instance.config;

        if (! disabled || forced) {

            if (! isset(state)) {
                // If the instance doesn't control the components.
                // then close the instance that controls the components.
                if (isOpen && instance !== alwan) {
                    _toggle(alwan, false);
                }

                state = ! isOpen;
            }

            if (state !== isOpen && (shared || toggle || forced)) {
                if (state) {
                    if (instance !== alwan) {
                        // Set components to point to the new instance,
                        // and update options.
                        _setup(instance.config, instance);
                    }
                    alwan._color._update({}, true);

                    // Update popover position before open.
                    if (state) {
                        _reposition();
                    }
                }

                // Only the instance that controls the components,
                // open/close the picker.
                if (instance === alwan) {
                    isOpen = state;
                    toggleClassName(root, OPEN_CLASSNAME, state);
                    alwan._events._dispatch(state ? OPEN : CLOSE, root);
                }
            }
        }
    }

    /**
     * Updates the popover's position.
     */
    const _reposition = () => {
        if (popoverInstance) {
            popoverInstance._update();
        }
    }

    /**
     * Gets current picker state (opened or closed).
     *
     * @returns {boolean}
     */
    const _isOpen = () => {
        return isOpen;
    }

    /**
     * Destroy components and remove root element from the DOM.
     */
    const _destroy = () => {
        if (popoverInstance) {
            popoverInstance._destroy();
        }
        removeElement(root);
    }

    return {
        _setup,
        _reposition,
        _toggle,
        _isOpen,
        _destroy
    }
}