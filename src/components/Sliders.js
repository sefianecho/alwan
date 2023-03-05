import { ALPHA_SLIDER_CLASSNAME, HUE_SLIDER_CLASSNAME, SLIDERS_CLASSNAME } from "../constants/classnames";
import { CHANGE, COLOR, COLOR_PROPERTY, INPUT } from "../constants/globals";
import { createElement, createSlider, removeElement, setCustomProperty } from "../utils/dom";

/**
 * Creates sliders component.
 *
 * @param {Element} parent - Element to append sliders to.
 * @param {Object} alwan - Alwan instance.
 * @returns {Object} Sliders component.
 */
export const Sliders = (parent, alwan, events) => {
    /**
     * Alpha slider.
     *
     * @type {HTMLInputElement}
     */
    let alphaSlider;

    /**
     * Sliders container.
     */
    const container = createElement('', SLIDERS_CLASSNAME, parent);

    /**
     * Hue slider.
     *
     * @type {HTMLInputElement}
     */
    const hueSlider = createSlider(HUE_SLIDER_CLASSNAME, container, 360);

    /**
     * Updates color.
     *
     * @param {InputEvent} param0 - Event.
     */
    const handleChange = ({ target, type, target: { value } }) => {
        alwan._color._update(target === hueSlider ? { h: 360 - value } : { a: value * 1 });
        alwan._events._dispatch(type === CHANGE ? CHANGE : COLOR, target);
    }

    /**
     * Bind events.
     */
    events._bind(container, [INPUT, CHANGE], handleChange);


    return {
        /**
         * Initialize sliders.
         *
         * @param {object} param0 - Alwan options.
         * @param {object} instance - Alwan instance.
         */
        _init({ opacity }, instance) {
            alwan = instance || alwan;

            if (opacity !== !! alphaSlider) {
                if (opacity) {
                    alphaSlider = createSlider(ALPHA_SLIDER_CLASSNAME, container, 1, 0.01);
                } else {
                    alphaSlider = removeElement(alphaSlider);
                    alwan._color._update({ a: 1 });
                }
            }
        },

        /**
         * Sets sliders values.
         *
         * @param {object} param0 - HSV color object.
         */
        _setValue({ h, a }) {
            hueSlider.value = 360 - h;
            if (alphaSlider) {
                alphaSlider.value = a;
            }
        },

        /**
         * Sets alpha slider's gradient color.
         *
         * @param {string} rgb - RGB color string without transparency.
         */
        _sliderGradient(rgb) {
            setCustomProperty(alphaSlider, COLOR_PROPERTY, rgb);
        }
    };
}