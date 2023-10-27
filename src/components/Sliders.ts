import type Alwan from '..';
import { ALPHA_SLIDER_CLASSNAME, HUE_SLIDER_CLASSNAME } from '../constants/classnames';
import { ARIA_LABEL, CHANGE, SLIDERS_ID } from '../constants/globals';
import { createSlider } from '../lib/slider';
import type { ISliders, Slider } from '../types';
import { createDivElement, removeElement, setAttribute } from '../utils/dom';

/**
 * Creates hue and opacity sliders.
 *
 * @param param0 - Alwan instance.
 * @param parent - Element to insert sliders to.
 * @returns - Sliders component.
 */
export const Sliders = ({ _color: colorState, _events }: Alwan, parent: HTMLElement): ISliders => {
    let alphaSlider: Slider | null;

    /**
     * Handles sliders value change.
     *
     * @param value - Slider value.
     * @param source - Target.
     * @param stop - Whether it is a change stop.
     */
    const handleChange = (value: number, source: HTMLElement, stop?: boolean) => {
        if (stop) {
            _events._emit(CHANGE, source);
        } else {
            colorState._update(
                source === hueSlider.el ? { h: value } : { a: value },
                source,
                SLIDERS_ID
            );
        }
    };

    const container = createDivElement('', parent);
    const hueSlider = createSlider(HUE_SLIDER_CLASSNAME, container, handleChange, 360, 1, true);

    return {
        /**
         * Creates and initializes the sliders.
         *
         * @param param0 - Options.
         */
        _init({ opacity, i18n: { sliders } }) {
            alphaSlider = alphaSlider && removeElement(alphaSlider.el);

            if (opacity) {
                alphaSlider = createSlider(
                    ALPHA_SLIDER_CLASSNAME,
                    container,
                    handleChange,
                    1,
                    0.01
                );
                setAttribute(alphaSlider.el, ARIA_LABEL, sliders.alpha);
            } else {
                colorState._update({ a: 1 });
            }

            setAttribute(hueSlider.el, ARIA_LABEL, sliders.hue);
        },

        /**
         * Sets sliders values.
         *
         * @param h - Hue.
         * @param a - Alpha (opacity).
         */
        _setValues(h, a) {
            hueSlider._setValue(h);
            alphaSlider && alphaSlider._setValue(a);
        },
    };
};
