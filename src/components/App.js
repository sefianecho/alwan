import { POPUP_CLASSNAME } from "../classnames";
import { BUTTON, ESCAPE, INPUT, KEY_DOWN, RESIZE, ROOT, SCROLL, TAB } from "../constants";
import { Binder } from "../core/events/binder";
import { createPopper } from "../lib/popper";
import { getElement, getScrollableAncestors, insertElement, isInViewport, removeElement, toggleClassName, toggleVisibility } from "../utils/dom";
import { objectIterator } from "../utils/object";
import { isString } from "../utils/string";

/**
 * Creates App componenet and initialize components.
 *
 * @param {Element} root - Picker container.
 * @param {Alwan} alwan - Alwan instance.
 * @returns {App}
 */
export const App = (root, alwan, events) => {
    /**
     * Alwan reference component.
     */
    let reference;

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
     * Last focusable element in the components.
     *
     * @type {Element}
     */
    let lastFocusableElement;

    /**
     * Updates popper's position and visibility.
     * 
     * @param {Event} e - Event. 
     */
    let updatePopper = e => {
        if (reference._isOpen()) {

            popper._update();

            // Close picker if popper's reference is scrolled out of view.
            if (! isInViewport(popper._reference, scrollableAncestors)) {
                reference._close();
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
    let handleAccessibility = e => {
        if (reference._isOpen()) {
            let { target, key, shiftKey } = e;
            let paletteElement = alwan._components._palette._element;
            let elementToFocusOn;
            // Pressing Escape key closes the picker.
            if (key === ESCAPE) {
                reference._close();
            } else if (key === TAB) {
                if (target === reference._element && ! shiftKey) {
                    // Pressing Tab while focusing on the reference element sends focus,
                    // to the first element (palette) inside the picker container.
                    elementToFocusOn = paletteElement;
                } else if ((shiftKey && target === paletteElement) || (! shiftKey && target === lastFocusableElement)) {
                    // Pressing Tab while focusing on the palette with the shift key or focussing on the last,
                    // focusable element without shift key sends focus to the reference element (if it's focusable).
                    elementToFocusOn = reference._element;
                }
                if (elementToFocusOn) {
                    e.preventDefault();
                    elementToFocusOn.focus();
                }
            }
        }
    }

    return {
        /**
         * Picker container.
         */
        _root: root,

        /**
         * Setup and Initialize other components.
         *
         * @param {object} options - Alwan options.
         * @param {object} instance - Alwan instance. 
         */
        _setup(options, instance = alwan) {
            alwan = instance;
            let { theme, popover, target, position, margin, id, toggle, shared } = options;
            let targetElement = getElement(target);
    
            if (isString(id) && id) {
                root.id = id;
            }
            // Shared option force the toggle.
            if (shared) {
                toggle = true;
            }
    
            // Initialize components.
            objectIterator(alwan._components, ({ _init }) => {
                if (_init) {
                    _init(options, alwan);
                }
            })

            reference = alwan._reference;
            target = targetElement || reference._element;

            // Set theme (dark or light).
            root.dataset.theme = theme;

            // Toggle option changed to false then open (show) the picker
            if (! toggle) {
                reference._open(true);
            }
            // Hide reference element if both popover and toggle are false.
            toggleVisibility(reference._element, popover || toggle);
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
                popperEvents._bind(ROOT, KEY_DOWN, handleAccessibility);
            } else {
                insertElement(root, target, ! targetElement && 'afterend');
            }

            lastFocusableElement = [...getElement(BUTTON + ',' + INPUT, root, true)].pop();
        },

        /**
         * Updates the popper's position.
         */
        _reposition() {
            if (popper) {
                popper._update();
            }
        },

        /**
         * Gets instance that controls the components.
         *
         * @returns {object} - Alwan instance.
         */
        _getInstance: () => alwan,

        /**
         * Destroy components and remove root element from the DOM.
         */
        _destroy() {
            // Remove components events.
            events._unbindAll();
            // Remove popper events.
            popperEvents._unbindAll();
            root = removeElement(root);
            alwan = {};
        }
    }
}