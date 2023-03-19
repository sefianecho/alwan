import { PRESET_BUTTON_CLASSNAME } from "../constants/classnames";
import { POINTER_DOWN, ROOT } from "../constants/globals";
import { Binder } from "../core/events/binder";
import { body, createButton, getElement, removeElement, replaceElement, toggleClassName } from "../utils/dom";
import { isString } from "../utils/string";

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
                toggleClasses(element, classes, false);
                classes = classname.split(/\s+/);
                // Add the new classname.
                toggleClasses(element, classes);
            }

            self._element = element;
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

    // Event listener.
    events._bind(ROOT, POINTER_DOWN, ({ target }) => { alwan._components._app._setVisibility(alwan, target); });

    return self;
}