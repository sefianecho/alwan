import type Alwan from "..";
import { HSLToRGB, RGBToHEX, RGBToHSL } from "../colors/conversions";
import { parseColor } from "../colors/parser";
import { CHANGE, COLOR, RGB_FORMAT } from "../constants/globals";
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

        _update(hsl, triggerColorEvent = true, ignoreRGB) {
            const previousHex = state.hex;

            merge(state, hsl);
            !ignoreRGB && merge(state, HSLToRGB(state));

            state.s = round(state.s);
            state.l = round(state.l);

            state.rgb = stringify(state);
            state.hsl = stringify(state, true);
            state.hex = RGBToHEX(state);

            onUpdate(state);

            if (triggerColorEvent && previousHex !== state.hex) {
                emitEvent(COLOR, state);
            }
        },

        _setColor(color, triggerColorEvent = false, triggerChangeEvent) {
            const [colorObject, colorFormat] = <[RGBA | HSLA, colorFormat]>(
                parseColor(color)
            );
            const isRGB = colorFormat === RGB_FORMAT;

            if (!config.opacity) {
                colorObject.a = 1;
            }

            if (state[colorFormat] !== stringify(colorObject, !isRGB)) {
                merge(
                    state,
                    colorObject,
                    isRGB ? RGBToHSL(<RGBA>colorObject) : {},
                );
                this._update({}, triggerColorEvent, isRGB);
                onSetColor(state);

                if (triggerChangeEvent) {
                    emitEvent(CHANGE, state);
                }
            }
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
