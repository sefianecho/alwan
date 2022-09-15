import { BUTTON, CLICK, COLOR_PROPERTY, int } from "../constants";
import { bindEvent } from "../core/events/EventBinder";
import { parseColor } from "../lib/parser";
import { createElement, getParent, removeElement, setCustomProperty, setElementsHTML, setVisibility } from "../utils/dom";
import { setColorAndTriggerEvents } from "../utils/util";

/**
 * Swatches constants.
 */
const SWATCHES_CLASSNAME = 'alwan__swatches';
const SWATCHE_CLASSNAME = 'alwan__swatch';

/**
 * Swatches component.
 *
 * @param {Element} parent - Element to append the palette element to.
 * @param {Object} alwan - Picker Instance.
 * @returns {Object}
 */
export const Swatches = (parent, alwan) => {

    /**
     * Buttons wrapper element.
     */
    let container = createElement('', SWATCHES_CLASSNAME, parent);

    /**
     * Swatches array.
     */
    let swatches;

    /**
     * Creates a swatch button.
     *
     * @param {String} color - Swatch Color.
     * @returns {Element}
     */
    const createSwatchButton = color => createElement(BUTTON, SWATCHE_CLASSNAME, container, {
            type: BUTTON,
        }, button => { setCustomProperty(button, COLOR_PROPERTY, parseColor(color, true)) });

    /**
     * Swatches API.
     */
    const self = {
        /**
         * Swatches events.
         */
        e: [],

        /**
         * Initialize swatches.
         *
         * @param {Object} options - Alwan options.
         */
        init(options) {
            let buttons = [];
            swatches = options.swatches;
    
            setVisibility(container, swatches);
            // Empty the container from all swatch buttons.
            setElementsHTML(container);
    
            swatches.forEach((color, index) => {
                buttons[index] = createSwatchButton(color);
            });

            self.$ = buttons;
        },
        /**
         * Adds a swatch button.
         *
         * @param {String} color - Color.
         */
        add(color) {
            let index = swatches.push(color) - 1;
            self.$[index] = createSwatchButton(color);
    
            // If swatches array is empty, hide container.
            setVisibility(container, swatches);
        },
        /**
         * Removes a swatch button.
         *
         * @param {String|Number} swatch - Color or Swatch Index.
         */
        remove(swatch) {
            let index = swatches.findIndex((color, index) => swatch === color || int(swatch) === index);
            let swatchButtons = self.$;

            if (index > -1) {
                // Remove color from swatches array.
                swatches.splice(index, 1);
                // Remove swatch button.
                removeElement(swatchButtons[index]);
                swatchButtons.splice(index, 1);

                // If swatches array is empty then hide the container.
                setVisibility(container, swatches);
            }
        }
    };

    /**
     * Sets color from a swatch button.
     *
     * @param {Event} e - Click.
     */
    const setColorFromSwatch = e => {
        let target = e.target;

        if (getParent(target) === container) {
            setColorAndTriggerEvents(alwan, target.style.getPropertyValue('--' + COLOR_PROPERTY), target);
        }
    }

    /**
     * Bind events.
     */
    bindEvent(self.e, parent, CLICK, setColorFromSwatch);

    return self;
}