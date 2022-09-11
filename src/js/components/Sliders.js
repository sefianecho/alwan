import { CHANGE, INPUT } from "../constants";
import { bindEvent } from "../core/events/EventBinder";
import { createElement, removeElement } from "../utils/dom";
import { isset } from "../utils/util";

const SLIDER_CLASSNAME = 'talwin__slider';
const HUE_SLIDER_CLASSNAME = SLIDER_CLASSNAME + ' ' + SLIDER_CLASSNAME + '--hue';
const ALPHA_SLIDER_CLASSNAME = SLIDER_CLASSNAME + ' ' + SLIDER_CLASSNAME + '--alpha'; 

/**
 * Picker sliders.
 *
 * @param {Element} parent - Element to append sliders to.
 * @param {Object} talwin - Talwin instance.
 * @returns {Object}
 */
export const Sliders = (parent, talwin) => {

    let { _clr: colorState, _e: { emit }} = talwin;

    /**
     * Sliders wrapper element.
     */
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
 
    /**
     * Component API.
     */
    const self = {
        /**
         * Sliders events.
         */
        e: [],

        hue: build(HUE_SLIDER_CLASSNAME, 360),
        alpha: null,

        /**
         * Init. Sliders.
         *
         * @param {Object} options - New options.
         */
        init(options) {
            let opacity = options.opacity;

            if (isset(opacity)) {

                let alpha = self.alpha;

                if (opacity !== !!alpha) {
                    self.alpha = opacity ? build(ALPHA_SLIDER_CLASSNAME, 1, 0.01) : removeElement(alpha, true);
                }
            }
        },

        /**
         * Sets sliders values.
         *
         * @param {Object} hsv - HSV color object.
         */
        val(hsv) {
            let { alpha, hue } = self;
            hue.value = 360 - hsv.h;
            alpha && (alpha.value = hsv.a);
        }
    }

    /**
     * Handles changes in a slider value.
     *
     * @param {Event} e - Input or Change event.
     */
    const handleChange = e => {
        let slider = e.target;
        let value = slider.valueAsNumber;
        let hsv = {};

        if (slider === self.hue) {
            hsv.h = 360 - value;
        } else {
            hsv.a = value;
        }

        colorState.update(hsv);
        emit(e.type === CHANGE ? 'change' : 'color', colorState.value, slider);
    }

    /**
     * Events binding.
     */
    bindEvent(self.e, container, [INPUT, CHANGE], handleChange);

    return self;
}