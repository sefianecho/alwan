import type Alwan from '..';
import {
    ALPHA_SLIDER_CLASSNAME,
    HUE_SLIDER_CLASSNAME,
    SLIDERS_CLASSNAME,
} from '../constants/classnames';
import { ARIA_LABEL, CHANGE, INPUT, SLIDERS_ID } from '../constants/globals';
import { addEvent } from '../core/events/binder';
import type { ISliders } from '../types';
import { createDivElement, createRangeInput, removeElement, setAttribute } from '../utils/dom';

/**
 * Creates hue and opacity sliders.
 *
 * @param param0 - Alwan instance.
 * @param parent - Element to insert sliders to.
 * @returns - Sliders component.
 */
export const Sliders = ({ _color: colorState, _events }: Alwan, parent: HTMLElement): ISliders => {
    let alphaSlider: HTMLInputElement | null;
    const container = createDivElement(SLIDERS_CLASSNAME, parent);
    const hueSlider = createRangeInput(HUE_SLIDER_CLASSNAME, container, '360', '1');

    /**
     * Updates hue and alpha of the color state.
     *
     * @param e - Change Event.
     */
    const handleChange = (e: Event) => {
        const target = <HTMLInputElement>e.target;
        const value = +target.value;

        if (e.type === CHANGE) {
            _events._emit(CHANGE, target);
        } else {
            colorState._update(
                target === hueSlider ? { h: 360 - value } : { a: value },
                target,
                SLIDERS_ID
            );
        }
    };

    /**
     * Bind events.
     */
    addEvent(container, INPUT, handleChange);
    addEvent(container, CHANGE, handleChange);

    return {
        /**
         * Creates and initializes the sliders.
         *
         * @param param0 - Options.
         */
        _init({ opacity, i18n: { sliders } }) {
            alphaSlider = removeElement(alphaSlider);
            if (opacity) {
                alphaSlider = createRangeInput(ALPHA_SLIDER_CLASSNAME, container, '1', '0.01');
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
            hueSlider.value = 360 - h + '';
            if (alphaSlider) {
                alphaSlider.value = a + '';
            }
        },
    };
};
