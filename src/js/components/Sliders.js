import { createElement } from "../utils/dom";

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
    }





    return self;
}