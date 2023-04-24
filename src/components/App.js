import { OPEN_CLASSNAME, POPUP_CLASSNAME } from "../constants/classnames";
import { BUTTON, CLOSE, ESCAPE, INPUT, KEY_DOWN, OPEN, POINTER_DOWN, RESIZE, ROOT, SCROLL, TAB } from "../constants/globals";
import { Binder } from "../core/events/binder";
import { createPopper } from "../lib/popper";
import { getElement, getScrollableAncestors, insertElement, isInViewport, removeElement, toggleClassName, toggleVisibility } from "../utils/dom";
import { objectIterator } from "../utils/object";
import { isString } from "../utils/string";
import { isset } from "../utils/util";

/**
 * Creates App componenet and initialize components.
 *
 * @param {Element} root - Picker container.
 * @param {Alwan} alwan - Alwan instance.
 * @returns {App}
 */
export const App = (root, alwan, events) => {
    /**
     * Alwan reference element.
     */
    let referenceElement;

    /**
     * Popper event binder.
     */
    let popperEvents = Binder();

    /**
     * Popper instance.
     */
    let popper;

    /**
     * Popper reference's scrollable ancestors.
     *
     * @type {Array[Element]}
     */
    let scrollableAncestors;

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
        let { theme, popover, target, position, margin, id, toggle, shared } = options;
        let targetElement = getElement(target);

        if (isString(id) && ! shared) {
            root.id = id;
        }

        // Initialize components.
        objectIterator(alwan._components, ({ _init }) => {
            if (_init) {
                _init(options, alwan);
            }
        })

        referenceElement = alwan._reference._element;
        target = targetElement || referenceElement;

        // Set theme (dark or light).
        root.dataset.theme = theme;

        // Toggle option changed to false then open (show) the picker
        if (! toggle && ! shared) {
            _toggle(alwan, true, true);
        }
        // Hide reference element if both popover and toggle are false.
        // and the components are not shared.
        toggleVisibility(referenceElement, popover || toggle || shared);
        // Toggle popup class that makes the root's position fixed.
        toggleClassName(root, POPUP_CLASSNAME, popover);

        popperEvents._unbindAll();
        popper = null;

        if (popover) {
            popper = createPopper(target, root, {
                _margin: margin,
                _position: position
            });
            popper._update();
            // If reference element inside a nested scrollable elements,
            // get all those scrollable elements in an array.
            scrollableAncestors = getScrollableAncestors(target);
            // Attach scroll event to all scrollable ancestors of the reference element,
            // in order to update the popper's position.
            // On window resize reposition the popper.
            popperEvents._bind(window, RESIZE, updatePopper);
            scrollableAncestors.forEach(scrollable => {
                popperEvents._bind(scrollable, SCROLL, updatePopper);
            });
            popperEvents._bind(ROOT, [KEY_DOWN, POINTER_DOWN], handleAccessibility);
        } else {
            root.style = '';
            insertElement(root, target, ! targetElement && 'afterend');
        }
    }

    /**
     * Updates popper's position and visibility.
     *
     * @param {Event} e - Event.
     */
    const updatePopper = e => {
        if (isOpen) {

            popper._update();

            // Close picker if popper's reference is scrolled out of view.
            if (! isInViewport(popper._reference, scrollableAncestors)) {
                _toggle(alwan, false);
            }
        }
    }

    /**
     * Handles keyboard accessibility.
     *
     * If picker is displayed as a popover then link the focus from the reference,
     * to the picker focusable elements.
     *
     * @param {KeyboardEvent} e - Event.
     */
    const handleAccessibility = e => {
        if (isOpen) {
            let { target, key, shiftKey } = e;
            let paletteElement = alwan._components._palette._element;
            let elementToFocusOn;
            let lastFocusableElement;

            // Close picker if:
            // - Escape key is pressed.
            // - A pointerdown event happened ouside the picker and not on the reference element or one of its labels,
            // (only if the reference element is a labelable element).
            if (key === ESCAPE || (target !== referenceElement && ! root.contains(target) && ! [...referenceElement.labels || []].some(label => label.contains(target)))) {
                _toggle(alwan, false);
            } else if (key === TAB) {

                lastFocusableElement = [...getElement(BUTTON + ',' + INPUT, root, true)].pop();

                if (target === referenceElement && ! shiftKey) {
                    // Pressing Tab while focusing on the reference element sends focus,
                    // to the first element (palette) inside the picker container.
                    elementToFocusOn = paletteElement;
                } else if ((shiftKey && target === paletteElement) || (! shiftKey && target === lastFocusableElement)) {
                    // Pressing Tab while focusing on the palette with the shift key or focussing on the last,
                    // focusable element without shift key sends focus to the reference element (if it's focusable).
                    elementToFocusOn = referenceElement;
                }
                if (elementToFocusOn) {
                    e.preventDefault();
                    elementToFocusOn.focus();
                }
            }
        }
    }

    /**
     * Toggles color picker visiblity.
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
                    _reposition();
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
     * Updates the popper's position.
     */
    const _reposition = () => {
        if (popper) {
            popper._update();
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
        // Remove components events.
        events._unbindAll();
        // Remove popper events.
        popperEvents._unbindAll();
        root = removeElement(root);
        alwan = {};
    }

    return {
        _root: root,
        _setup,
        _reposition,
        _toggle,
        _isOpen,
        _destroy
    }
}