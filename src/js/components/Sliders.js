import { createElement, removeElement } from "../utils/dom";
import { isSet } from "../utils/util";

const SLIDER_CLASSNAME = 'talwin__slider';
const HUE_SLIDER_CLASSNAME = SLIDER_CLASSNAME + ' ' + SLIDER_CLASSNAME + '--hue';
const ALPHA_SLIDER_CLASSNAME = SLIDER_CLASSNAME + ' ' + SLIDER_CLASSNAME + '--alpha'; 


export const Sliders = (parent, talwin) => {

    const container = createElement('', 'tw-w100', parent);

    /**
     * Builds a slider.
     *
     * @param {String} className - Slider classname.
     * @param {Number} max - Slider max value.
     * @param {Number} step - Slider step.
     * @returns {HTMLElement}
     */
    const build = (className, max, step) => 
         createElement('input', className, container, { type: 'range', max, step });
 
    const self = {
        hue: build(HUE_SLIDER_CLASSNAME, 360),
        alpha: null,

        /**
         * Init. Sliders.
         *
         * @param {Object} options - New options.
         */
        init(options) {
            let opacity = options.opacity;

            if (isSet(opacity)) {

                let alpha = self.alpha;

                if (opacity !== !!alpha) {
                    self.alpha = opacity ? build(ALPHA_SLIDER_CLASSNAME, 1, 0.01) : removeElement(alpha, true);
                }
            }
        }
    }





    return self;
}