import { CLICK, int } from "../constants";
import { bindEvent } from "../core/events/EventBinder";
import { parseColor } from "../lib/parser";
import { createElement, getParent, removeElement, setVisibility } from "../utils/dom";

const SWATCHES_CLASSNAME = 'talwin__swatches';
const SWATCHE_CLASSNAME = 'talwin__swatch';

/**
 * Swatches component.
 *
 * @param {Element} parent - Element to append the palette element to.
 * @param {Object} talwin - Picker Instance.
 * @returns 
 */
export const Swatches = (parent, talwin) => {

    const { _clr: { value, updateByString }, _e: { emit } } = talwin;

    /**
     * Buttons wrapper element.
     */
    let container = createElement('', SWATCHES_CLASSNAME, parent);

    /**
     * Swatches array.
     */
    let swatches;

    /**
     * Event listeners.
     */
    let listeners = [];

    /**
     * Creates a swatch button.
     *
     * @param {String} color - Swatch Color.
     * @param {Number} index - Swatch Index.
     * @returns {Element}
     */
    const createSwatchButton = (color, index) => createElement('button', SWATCHE_CLASSNAME, container, {
            type: 'button',
            style: '--tw-color:' + parseColor(color, true),
            'data-index': index + ''
        });

    /**
     * Swatches API.
     */
    const self = {
        /**
         * Initialize swatches.
         *
         * @param {Object} options - Talwin options.
         */
        init(options) {
            let buttons = [];
            swatches = options.swatches;
    
            setVisibility(container, swatches);
            container.innerHTML = '';
    
            swatches.forEach((color, index) => {
                buttons[index] = createSwatchButton(color, index);
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
            self.$[index] = createSwatchButton(color, index);
    
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
    
            if (index > -1) {
                // Remove color from swatches array.
                swatches.splice(index, 1);
                // Remove swatch button.
                removeElement(self.$[index]);
                self.$.splice(index, 1);
    
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

        if (getParent(target) === container && updateByString(swatches[target.dataset.index], true)) {
            emit('color', value, target);
            emit('change', value, target);
        }
    }

    /**
     * Bind events.
     */
    bindEvent(listeners, parent, CLICK, setColorFromSwatch);

    return self;
}