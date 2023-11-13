import type Alwan from '..';
import { ALPHA_SLIDER_CLASSNAME, HUE_SLIDER_CLASSNAME } from '../constants/classnames';
import { ARIA_LABEL, CHANGE, INPUT, SLIDERS_ID } from '../constants/globals';
import { addEvent } from '../core/events/binder';
import type { ISliders } from '../types';
import { createDivElement, createSlider, removeElement, setAttribute } from '../utils/dom';

/**
 * Creates hue and opacity sliders.
 *
 * @param param0 - Alwan instance.
 * @param parent - Element to insert sliders to.
 * @returns - Sliders component.
 */
export const Sliders = ({ _color: colorState, _events }: Alwan, parent: HTMLElement): ISliders => {
    let alphaSlider: HTMLInputElement | null;

    const container = createDivElement('', parent);
    const hueSlider = createSlider(HUE_SLIDER_CLASSNAME, container, 360);
    /**
     * Handle hue slider change, update hue in the color state.
     */
    addEvent(hueSlider, INPUT, () => colorState._update({ h: +hueSlider.value }, SLIDERS_ID));
    /**
     * Handles sliders change stop (change event).
     */
    addEvent(container, CHANGE, () => _events._emit(CHANGE));

    return {
        /**
         * Creates and initializes the sliders.
         *
         * @param param0 - Options.
         */
        _init({ opacity, i18n: { sliders } }) {
            alphaSlider = removeElement(alphaSlider);

            if (opacity) {
                alphaSlider = createSlider(ALPHA_SLIDER_CLASSNAME, container, 1, 0.01);
                /**
                 * Handles alpha slider change, update alpha channel in the color state.
                 */
                addEvent(alphaSlider, INPUT, () =>
                    colorState._update({ a: +alphaSlider!.value }, SLIDERS_ID)
                );
            } else {
                colorState._update({ a: 1 });
            }

            setAttribute(hueSlider, ARIA_LABEL, sliders.hue);
            setAttribute(alphaSlider, ARIA_LABEL, sliders.alpha);
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
