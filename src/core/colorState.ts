import type Alwan from '..';
import { CHANGE, COLOR, HSL_FORMAT, RGB_FORMAT } from '../constants/globals';
import { parseColor } from '../lib/colors/parser';
import { stringify } from '../lib/colors/stringify';
import type {  IColorState, RGBA, colorDetails, colorFormat } from '../types';
import { round } from '../utils/math';
import { merge } from '../utils/object';
import { HSLToRGB, RGBToHEX, RGBToHSL } from '../lib/colors/conversions';

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
         * @param silent - If true then don't fire the color event.
         * @param ignoreRGB - If true then don't update RGB values.
         */
        _update(hsl, silent = false, ignoreRGB?: boolean) {
            previousHex = state.hex;
            merge(state, hsl);
            !ignoreRGB && merge(state, HSLToRGB(state));

            state.s = round(state.s);
            state.l = round(state.l);

            state.rgb = stringify(state);
            state.hsl = stringify(state, HSL_FORMAT);
            state.hex = RGBToHEX(state);

            alwan._app._updateUI(state);

            if (!silent && previousHex !== state.hex) {
                emitEvent(COLOR, state);
            }
        },

        /**
         * Updates the state and the UI including the controls (palette & sliders).
         *
         * @param silent - If true then don't fire the color event.
         * @param ignoreRGB - If true then don't update RGB values.
         */
        _updateAll(silent, ignoreRGB) {
            this._update({}, silent, ignoreRGB);
            alwan._app._updateControls(state);
        },

        /**
         * Updates color state from a string or a color object.
         *
         * @param color - Color string or Object.
         * @param componentId - The component that setting the color.
         * @param silentColorEvent - If true don't fire color event.
         * @param silentChangeEvent - If true don't fire change event.
         */
        _setColor(color, silentColorEvent = true, silentChangeEvent = true) {
            const [colorObject, colorFormat, colorString] = parseColor(color);
            const isRGB = colorFormat === RGB_FORMAT;

            if (state[colorFormat] !== colorString) {
                // Merge parsed color to the state if it's hsl,
                // if it's rgb then convert it to hsl and merge both rgb and hsl.
                merge(state, colorObject, isRGB ? RGBToHSL(<RGBA>colorObject) : {});
                this._updateAll(silentColorEvent, isRGB);

                if (!silentChangeEvent) {
                    emitEvent(CHANGE, state);
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
         */
        _change() {
            if (cashedColor !== state[currentFormat]) {
                emitEvent(CHANGE, state);
            }
        },

        /**
         * sets color format.
         *
         * @param format - Color format to set.
         */
        _setFormat(format) {
            currentFormat = alwan.config.format = format;
        },

        /**
         * @returns - Current color string in the current format.
         */
        _colorString: () => state[currentFormat],
    };
};
