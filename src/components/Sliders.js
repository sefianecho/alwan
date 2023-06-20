import { ALPHA_SLIDER_CLASSNAME, HUE_SLIDER_CLASSNAME, SLIDERS_CLASSNAME } from "../constants/classnames";
import { CHANGE, COLOR, INPUT } from "../constants/globals";
import { addEvent } from "../core/events/binder";
import { createElement, createSlider, removeElement } from "../utils/dom";

/**
 * Creates hue and alpha sliders.
 *
 * @param {HTMLElement} ref - Element to append sliders to.
 * @param {Object} alwan - Alwan instance.
 * @returns {Object} Sliders component.
 */
export const Sliders = (ref, alwan) => {
    /**
     * Alpha slider.
     *
     * @type {HTMLInputElement | null}
     */
    let alphaSlider;

    /**
     * Sliders container.
     */
    const container = createElement('', SLIDERS_CLASSNAME, ref);

    /**
     * Hue slider.
     *
     * @type {HTMLInputElement}
     */
    const hueSlider = createSlider(HUE_SLIDER_CLASSNAME, container, 360);

    /**
     * Updates color.
     *
     * @param {InputEvent} e - Event.
     */
    const handleChange = (e) => {
        const target = e.target;
        const value = target.value;
        alwan._color._update(target === hueSlider ? { h: 360 - value } : { a: value * 1 });
        alwan._events._dispatch(type === CHANGE ? CHANGE : COLOR, target);
    }

    /**
     * Bind events.
     */
    addEvent(container, INPUT, handleChange);
    addEvent(container, CHANGE, handleChange);


    return {
        /**
         * Initialize sliders.
         *
         * @param {object} param0 - Alwan options.
         * @param {object} instance - Alwan instance.
         */
        _init({ opacity }, instance) {
            alwan = instance || alwan;

            alphaSlider = removeElement(alphaSlider);

            if (opacity) {
                alphaSlider = createSlider(
                    ALPHA_SLIDER_CLASSNAME,
                    container,
                    1,
                    0.01
                );
            } else {
                alwan._color._update({ a: 1 });
            }
        },

        /**
         * Sets sliders values.
         *
         * @param {object} param0 - HSV color object.
         */
        _update({ h, a }) {
            hueSlider.value = 360 - h;
            if (alphaSlider) {
                alphaSlider.value = a;
            }
        }
    };
}