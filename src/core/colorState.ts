import type Alwan from '..';
import { CHANGE, COLOR, HSL_FORMAT, RGB_FORMAT } from '../constants/globals';
import { HSLToRGB, RGBToHEX, RGBToHSL } from '../lib/colors/conversions';
import { parseColor } from '../lib/colors/parser';
import { stringify } from '../lib/colors/stringify';
import type { HSLA, IColorState, RGBA, colorDetails, colorFormat } from '../types';
import { round } from '../utils/math';
import { merge } from '../utils/object';

/**
 * Creates a color state, updates it emit events when changes and,
 * updates UI.
 *
 * @param alwan - Instance.
 * @returns - Color state API.
 */
export const colorState = (alwan: Alwan): IColorState => {
    const state: colorDetails = {
        h: 0,
        s: 0,
        l: 0,

        r: 0,
        g: 0,
        b: 0,

        a: 1,

        rgb: '',
        hsl: '',
        hex: '',
    };
    const config = alwan.config;
    const emitEvent = alwan._events._emit;
    let currentFormat: colorFormat;
    let cashedColor: string;
    let previousHex: string;

    return {
        /**
         * Color details.
         */
        _value: state,

        /**
         * Updates color state and UI.
         *
         * @param hsl - HSL color components.
         * @param source - Element that updating the color state.
         * @param componentId - Component id of the component that updating the color state.
         * @param rgb - RGB color object.
         */
        _update(hsl, source, componentId, rgb) {
            if (!config.disabled) {
                previousHex = state.hex;
                merge(state, hsl);
                merge(state, rgb || HSLToRGB(state));

                state.s = round(state.s);
                state.l = round(state.l);

                state.rgb = stringify(state);
                state.hsl = stringify(state, HSL_FORMAT);
                state.hex = RGBToHEX(state);

                // TODO: update components.

                if (source && previousHex !== state.hex) {
                    emitEvent(COLOR, source, state);
                }
            }
        },

        /**
         * Updates color state from a string or a color object.
         *
         * @param color - Color string or Object.
         * @param source - Source element.
         * @param componentId - The component that setting the color.
         */
        _setColor(color, source, componentId, triggerChange) {
            const [parsedColor, parsedColorFormat, parsedColorString] = parseColor(color);
            let rgb: RGBA | undefined, hsl: Partial<HSLA>;

            if (state[parsedColorFormat] !== parsedColorString) {
                if (parsedColorFormat === RGB_FORMAT) {
                    rgb = <RGBA>parsedColor;
                    hsl = RGBToHSL(rgb);
                } else {
                    hsl = parsedColor;
                }
                this._update(hsl, source, componentId, rgb);

                if (triggerChange) {
                    emitEvent(CHANGE, source, state);
                }
            }
        },

        /**
         * Cache current color string.
         */
        _cache() {
            cashedColor = state[currentFormat];
        },

        /**
         * Compares the current color with the cashed color, if there are difference then
         * triggers change event.
         *
         * @param source - Event source.
         */
        _change(source) {
            if (cashedColor !== state[currentFormat]) {
                emitEvent(CHANGE, source, state);
            }
        },

        /**
         * sets color format.
         *
         * @param format - Color format to set.
         */
        _setFormat(format) {
            currentFormat = config.format = format;
        },

        /**
         * @returns - Current color string in the current format.
         */
        _colorString: () => state[currentFormat],
    };
};
