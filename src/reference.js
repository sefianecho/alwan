import { OPEN_CLASSNAME, PRESET_BUTTON_CLASSNAME } from "./classnames";
import { CLOSE, OPEN, POINTER_DOWN, ROOT } from "./constants";
import { Binder } from "./core/events/binder";
import { body, createButton, getElement, removeElement, replaceElement, toggleClassName } from "./utils/dom";
import { isString } from "./utils/string";
import { isset } from "./utils/util";

/**
 * Creates the reference control.
 * 
 * @param {string|Element} reference - User Reference.
 * @param {Alwan} param1 - Alwan instance.
 * @returns {object} - ReferenceElement control.
 */
export const Reference = (reference, alwan) => {
    /**
     * Visibility state.
     */
    let isOpen = false;

    /**
     * Reference element classes.
     */
    let classes = [];

    /**
     * Event binder.
     */
    const events = Binder();

    /**
     * Body.
     */
    const bodyElement = body();

    /**
     * Reference element.
     *
     * @type {Element|null}
     */
    const element = getElement(reference);

    /**
     * User reference.
     * 
     * Check if the reference element is valid.
     */
    const userReference = bodyElement.contains(element) && element !== bodyElement ? element : null;

    /**
     * Alwan options.
     */
    const config = alwan.config;

    /**
     * Reference API.
     */
    const self = {
        // If user reference is not valid element in the body, then create,
        // a preset button and append it to the body.
        _element: userReference ? userReference : createButton(PRESET_BUTTON_CLASSNAME, bodyElement),
        
        /**
         * Initialize Reference element.
         *
         * @param {object} param - Alwan options. 
         */
        _init({ preset, classname, disabled }) {
            let element = self._element;

            // If the user reference is valid then replace it with the preset button,
            // if preset option is true.
            if (userReference && preset !== (userReference !== element)) {
                if (preset) {
                    // Replace user reference with a preset button.
                    element = replaceElement(createButton(PRESET_BUTTON_CLASSNAME, null, { id: userReference.id }), userReference);
                } else {
                    // Replace preset button with the user reference.
                    element = replaceElement(userReference, element);
                }
            }

            // Add custom classes to the preset button.
            if (! userReference || preset && isString(classname)) {
                // Remove previously add classes.
                toggleClasses(element, classes, false);
                classes = classname.split(/\s+/);
                // Add the new classname.
                toggleClasses(element, classes);
            }

            self._element = element;
            if (isset(disabled)) {
                self._toggleDisable(disabled);
            }
        },

        /**
         * Gets current picker state (opened or closed).
         *
         * @returns Picker state.
         */
        _isOpen: () => isOpen,

        /**
         * Shows the color picker.
         *
         * @param {boolean} silent - Indicate whether to dispatch the open event or not.
         */
        _open(silent) {
            if (! isOpen && ! config.disabled) {
                let app = alwan._components._app;
                let instance = app._getInstance();

                // Components are shared, and this instance doesn't control these components.
                if (instance !== alwan) {
                    if (instance._reference) {
                        instance._reference._close();
                    }
                    app._setup(config, alwan);
                }

                alwan._color._update();
                app._reposition();
                setState(true, silent);
            }
        },

        /**
         * Hides the color picker.
         *
         * @param {boolean} silent - Indicate whether to dispatch the close event or not.
         */
        _close(silent) {
            if (isOpen && (config.shared || config.toggle)) {
                setState(false, silent);
            }
        },

        /**
         * Opens/Closes the color picker.
         */
        _toggle() {
            isOpen ? self._close() : self._open();
        },

        /**
         * Changes state Disable/Enable.
         *
         * @param {boolean} disabled - Disabled state.
         */
        _toggleDisable(disabled) {
            config.disabled = disabled;
            if (disabled) {
                self._close(true);
            }
            self._element.disabled = disabled;
        },

        /**
         * Destroy reference component.
         */
        _destroy() {
            if (userReference) {
                self._init({ preset: false });
            } else {
                self._element = removeElement(self._element);
            }
            events._unbindAll();
        }
    }

    /**
     * Shows/Hide root element (container) and updates the state.
     *
     * @param {boolean} state - open or close.
     * @param {boolean} silent - Don't dispatch the event.
     */
    const setState = (state, silent) => {
        toggleClassName(alwan._components._app._root, OPEN_CLASSNAME, state);
        isOpen = state;

        if (! silent) {
            alwan._events._dispatch(state ? OPEN : CLOSE, self._element);
        }
    }

    /**
     * Adds/Removes array of classes to/from an element.
     *
     * @param {Element} element - Element.
     * @param {string[]} tokensArray - Array of classnames.
     * @param {boolean} toggler - True to add classes, false to remove them.
     */
    const toggleClasses = (element, tokensArray, toggler = true) => {
        tokensArray.forEach(className => {
            toggleClassName(element, className, toggler);
        });
    }

    /**
     * Handles Document clicks that results in opening/closing the Color picker.
     *
     * @param {PointerEvent} param0 - Event.
     */
    const handleClick = ({ target }) => {
        if (target === self._element) {
            self._toggle();
            // If The click is outside the color picker container and it displayed as,
            // popover then close it.
        } else if (isOpen && config.popover && ! alwan._components._app._root.contains(target)) {
            self._close();
        }
    }

    // Event listener.
    events._bind(ROOT, POINTER_DOWN, handleClick);

    return self;
}