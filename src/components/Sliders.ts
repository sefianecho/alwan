import type Alwan from "..";
import { CHANGE, INPUT } from "../constants/globals";
import { addEvent } from "../core/events/binder";
import type { ISliders } from "../types";
import { createDivElement, createSlider } from "../utils/dom";

export const Sliders = ({ _color: colorState, _events }: Alwan): ISliders => {
    let hue: HTMLInputElement;
    let alpha: HTMLInputElement | null;
    let container: HTMLDivElement;

    return {
        _init({ opacity, i18n: { sliders } }) {
            hue = createSlider(sliders.hue, "hue", 360);
            alpha = opacity
                ? createSlider(sliders.alpha, "alpha", 1, 0.01)
                : null;

            container = createDivElement("", [hue, alpha]);

            addEvent(container, CHANGE, () => _events._emit(CHANGE));
            addEvent(container, INPUT, ({ target }) =>
                colorState._update({
                    [target === hue ? "h" : "a"]: (target as HTMLInputElement)
                        .value,
                }),
            );
            return container;
        },

        _setValues(h, a) {
            hue.value = h + "";
            if (alpha) {
                alpha.value = a + "";
            }
        },
    };
};
