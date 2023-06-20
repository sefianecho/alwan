import { PRESET_BUTTON_CLASSNAME } from "../constants/classnames";
import { CLICK } from "../constants/globals";
import { addEvent, removeEvent } from "../core/events/binder";
import { bodyElement, createButton, removeElement, replaceElement, toggleClassName } from "../utils/dom";
import { isString, isset } from "../utils/is";

/**
 * Creates an element that controls (open/close) the color picker.
 *
 * @param {string|Element} reference - User Reference.
 * @param {Alwan} param1 - Alwan instance.
 * @returns {object} - ReferenceElement control.
 */
export const Reference = (userReference, alwan) => {

    /**
     * Reference element.
     *
     * @type {Element | HTMLButtonElement | null}
     */
    let element = userReference || createButton(PRESET_BUTTON_CLASSNAME, bodyElement());

    /**
     * Preset button user set classes.
     */
    let buttonClasses = [];

    /**
     * Handles mouse click.
     */
    let handleClick = () => {
        alwan.toggle();
    }

    /**
     * Reference API.
     */
    return {
        /**
         * Returns the reference element.
         *
         * @returns {Element}
         */
        _el: () => element,

        /**
         * Initialize Reference element.
         *
         * @param {object} param - Alwan options.
         */
        _init({ preset, classname }) {
            // userReference === element means preset button is not set.
            if (userReference && preset !== (userReference !== element)) {
                if (preset) {
                    // Replace user reference with a preset button.
                    element = replaceElement(userReference, createButton(PRESET_BUTTON_CLASSNAME, null, { id: userReference.id }));
                } else {
                    // Replace preset button with the user reference.
                    element = replaceElement(element, userReference);
                }
            }

            addEvent(element, CLICK, handleClick);

            // Add custom classes to the preset button.
            if ((! userReference || preset) && isString(classname)) {
                // Remove previously add classes.
                toggleClassName(element, buttonClasses, false);
                buttonClasses = classname.split(/\s+/);
                // Add the new classname.
                toggleClassName(element, buttonClasses, true);
            }
        },

        /**
         * Disables/Enables Picker instance.
         *
         * @param {boolean} disabled - Disable/Enable.
         */
        _setDisabled(disabled) {
            if (isset(disabled)) {
                const { config, _components } = alwan;
                const { shared, toggle } = config;
                const toggler = _components._app._toggle;

                config.disabled = element.disabled = !! disabled;

                if (disabled) {
                    toggler(alwan, false, true);
                } else if (! shared && ! toggle) {
                    toggler(alwan, true, true);
                }
            }
        },

        /**
         * Destroy reference component.
         */
        _destroy() {
            if (userReference) {
                this._init({ preset: false });
                removeEvent(element, CLICK, handleClick);
            } else {
                element = removeElement(element);
            }
        }
    }
}