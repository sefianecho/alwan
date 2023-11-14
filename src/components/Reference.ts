import type Alwan from '..';
import { BUTTON_CLASSNAME, REFERENCE_CLASSNAME } from '../constants/classnames';
import { CLICK } from '../constants/globals';
import { addEvent } from '../core/events/binder';
import type { IReference } from '../types';
import { bodyElement, createButton, removeElement, replaceElement } from '../utils/dom';
import { isString } from '../utils/is';

/**
 * Creates an element that controls (open/close) the color picker.
 *
 * @param alwan - Instance.
 * @param userRef - User reference.
 * @returns - Reference component.
 */
export const Reference = (alwan: Alwan, userRef?: Element): IReference => {
    /**
     * Reference element.
     */
    let element: Element = userRef || createButton('', bodyElement());

    /**
     * Handle click on the reference element.
     */
    const handleClick = () => {
        alwan._app._toggle();
    };

    return {
        /**
         * @returns - The reference element.
         */
        _el: () => element,
        /**
         * Initialize Reference element.
         *
         * @param param0 - Alwan config.
         */
        _init({ preset, classname }) {
            // userRef === element means preset button is not set.
            if (userRef && preset !== (userRef !== element)) {
                if (preset) {
                    // Replace user reference with a preset button.
                    element = replaceElement(userRef, createButton());
                    if (userRef.id) {
                        element.id = userRef.id;
                    }
                } else {
                    // Replace preset button with the user reference.
                    element = replaceElement(element, userRef);
                }
            }

            addEvent(element, CLICK, handleClick);

            // Add custom classes to the preset button.
            if ((!userRef || preset) && isString(classname)) {
                element.className = (BUTTON_CLASSNAME + REFERENCE_CLASSNAME + classname).trim();
            }
        },

        /**
         * Destroy reference component.
         */
        _destroy() {
            if (userRef && userRef !== element) {
                replaceElement(element, userRef);
            }
            removeElement(element);
        },
    };
};
