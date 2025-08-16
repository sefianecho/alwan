import type Alwan from "..";
import { HSLToRGB, RGBToHEX } from "../converter";
import { CHANGE, COLOR } from "../constants";
import { parseColor } from "../parser";
import { stringify } from "../stringify";
import type {
    HSLA,
    IColorState,
    RGBA,
    colorDetails,
    colorFormat,
    colorStateHook,
} from "../types";
import { round } from "../utils/math";
import { merge } from "../utils/object";

export const colorState = (alwan: Alwan): IColorState => {
    const state: colorDetails = {
        h: 0,
        s: 0,
        l: 0,

        r: 0,
        g: 0,
        b: 0,

        a: 1,

        rgb: "",
        hsl: "",
        hex: "",
    };
    const config = alwan.config;
    const emitEvent = alwan._events._emit;
    let onUpdate: colorStateHook;
    let onSetColor: colorStateHook;
    let currentFormat: colorFormat;
    let cashedColor: string;

    return {
        _value: state,

        _getColorString: () => state[currentFormat],
        _setHooks(onUpdateFn, onSetColorFn) {
            onUpdate = onUpdateFn;
            onSetColor = onSetColorFn;
        },

        _setFormat(format) {
            currentFormat = config.format = format;
        },

        _update(hsl, rgb, emitColor = true, emitChange) {
            const previousHex = state.hex;

            merge(state, hsl);
            merge(state, rgb || HSLToRGB(state));

            state.s = round(state.s);
            state.l = round(state.l);

            state.rgb = stringify(state);
            state.hsl = stringify(state, true);
            state.hex = RGBToHEX(state);

            onUpdate(state);

            if (previousHex !== state.hex) {
                emitColor && emitEvent(COLOR, state);
                emitChange && emitEvent(CHANGE, state);
            }
        },

        _setColor(color, emitColor = false, emitChange) {
            this._update(
                ...(parseColor(color, config.opacity) as [
                    HSLA,
                    RGBA | undefined,
                ]),
                emitColor,
                emitChange,
            );
            onSetColor(state);
        },

        _cache() {
            cashedColor = state[currentFormat];
        },

        /**
         * Emit change event if the color have changed compared to the cashed color.
         */
        _change() {
            if (cashedColor !== state[currentFormat]) {
                emitEvent(CHANGE, state);
            }
        },
    };
};
