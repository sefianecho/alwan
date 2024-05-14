import type Alwan from '..';
import { ALPHA_SLIDER_CLASSNAME, HUE_SLIDER_CLASSNAME } from '../constants/classnames';
import { ARIA_LABEL, CHANGE, INPUT } from '../constants/globals';
import { addEvent } from '../core/events/binder';
import type { ISliders } from '../types';
import { createDivElement, createSlider, setAttribute } from '../utils/dom';

/**
 * Creates hue and opacity sliders.
 *
 * @param param0 - Alwan instance.
 * @returns - Sliders component.
 */
export const Sliders = ({ _color: colorState, _events }: Alwan): ISliders => {
    let alphaSlider: HTMLInputElement | null;
    let container;
    const hueSlider = createSlider(HUE_SLIDER_CLASSNAME, 360);

    /**
     * Handles hue slider change.
     */
    addEvent(hueSlider, INPUT, () => colorState._update({ h: +hueSlider.value }));

    return {
        /**
         * Creates and initializes the sliders.
         *
         * @param param0 - Options.
         */
        _init({ opacity, i18n: { sliders } }) {
            alphaSlider = null;

            if (opacity) {
                alphaSlider = createSlider(ALPHA_SLIDER_CLASSNAME, 1, 0.01);
                /**
                 * Handles alpha slider change.
                 */
                addEvent(alphaSlider, INPUT, () => colorState._update({ a: +alphaSlider!.value }));
            } else {
                colorState._value.a = 1;
            }

            setAttribute(hueSlider, ARIA_LABEL, sliders.hue);
            setAttribute(alphaSlider, ARIA_LABEL, sliders.alpha);

            container = createDivElement('', hueSlider, alphaSlider);
            /**
            * Handles sliders change stop (change event).
            */
            addEvent(container, CHANGE, () => _events._emit(CHANGE));

            return container;
        },

        /**
         * Sets sliders values.
         *
         * @param h - Hue.
         * @param a - Alpha (opacity).
         */
        _setValues(h, a) {
            hueSlider.value = h + '';
            if (alphaSlider) {
                alphaSlider.value = a + '';
            }
        },
    };
};
