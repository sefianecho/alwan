import { PRESET_BUTTON_CLASSNAME } from "../constants/classnames";
import { POINTER_DOWN, ROOT } from "../constants/globals";
import { Binder } from "../core/events/binder";
import { body, createButton, getElement, removeElement, replaceElement, toggleClassName } from "../utils/dom";
import { isString } from "../utils/string";
import { isset } from "../utils/util";

/**
 * Creates the reference control.
 *
 * @param {string|Element} reference - User Reference.
 * @param {Alwan} param1 - Alwan instance.
 * @returns {object} - ReferenceElement control.
 */
export const Reference = (reference, alwan) => {

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
        _init({ preset, classname }) {
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
                toggleClassName(element, classes, false);
                classes = classname.split(/\s+/);
                // Add the new classname.
                toggleClassName(element, classes, true);
            }

            self._element = element;
        },

        /**
         * Disables/Enables Picker instance.
         *
         * @param {boolean} disabled - Disable/Enable.
         */
        _setDisabled(disabled) {
            if (isset(disabled)) {
                let { config, _components } = alwan;
                let { shared, toggle } = config;
                let toggler = _components._app._toggle;

                config.disabled = self._element.disabled = !! disabled;

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
                self._init({ preset: false });
            } else {
                self._element = removeElement(self._element);
            }
            events._unbindAll();
        }
    }

    // Event listener.
    events._bind(ROOT, POINTER_DOWN, ({ target }) => { alwan._components._app._setVisibility(alwan, target); });

    return self;
}