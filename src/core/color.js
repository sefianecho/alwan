import { HSLToRGB, RGBToHEX, RGBToHSL } from "../colors/converter";
import { parseColor } from "../colors/parser";
import { stringify } from "../colors/stringify";
import { CHANGE, COLOR, COLOR_PROPERTY, HEX_FORMAT, HSL_FORMAT, RGB_FORMAT } from "../constants/globals";
import { customProperty, setCustomProperty } from "../utils/dom";
import { round } from "../utils/number.js";
import { keys, merge, objectIterator } from "../utils/object";

/**
 * Creates the core color state and UI updater.
 *
 * @param {object} alwan - Alwan instance.
 * @returns {object} Core color state.
 */
export const color = (alwan) => {

    /**
     * Save an rgb string.
     *
     * @type {string}
     */
    let savedColor;

    /**
     * Current color format.
     *
     * @type {'rgb'|'hsl'|'hex'}
     */
    let format;

    /**
     * Color state.
     */
    const state = {
        // Hue.
        h: 0,
        // Saturation (capital S) and Lightness (capital L),
        // are used internally, their values are between 0-1.
        S: 0,
        L: 0,

        // HSL saturation and lightness (0-100)
        s: 0,
        l: 0,

        // Red, Green and Blue values (0-255)
        r: 0,
        g: 0,
        b: 0,

        // Opacity value (0-1)
        a: 1,

        // color strings.
        rgb: '',
        hex: '',
        hsl: ''
    }

    /**
     * Alwan options.
     */
    const config = alwan.config;

    /**
     * Gets color data.
     *
     * @param {object} color - Color object.
     * @param {string} format - Color format.
     * @param {boolean} asArray - Gets data as an array.
     * @param {string} str - Color string.
     * @returns {object} - Color data.
     */
    const colorData = (format, asArray, str) => {
        return (format + (config.opacity ? 'a' : ''))
                .split('')
                .reduce((output, channel, index) => {
                    output[asArray ? index : channel] = state[channel];
                    return output;
                }, merge(asArray ? [] : {}, { toString: () => str || stringify(state, format) }))
    }

    return {
        /**
         * Updates color state and UI.
         *
         * @param {object} hsl - HSL color components.
         * @param {HTMLElement | undefined} source - Element that updating the color.
         * @param {boolean | undefined} updateAll - Whether to update the palette and sliders components.
         * @param {object | undefined} rgb - RGB color object.
         */
        _update(hsl, source, updateAll = false, rgb) {
            if (! config.disabled) {

                merge(state, hsl);
                merge(
                    state,
                    {
                        s: round(state.S * 100),
                        l: round(state.L * 100),
                    },
                    rgb || HSLToRGB(state)
                );

                const { _inputs, _palette, _sliders, _utility } = alwan._components;
                const rgbString = stringify(state, RGB_FORMAT);
                const [opaqueHex, alphaHex] = RGBToHEX(state);

                state.hsl = stringify(state, HSL_FORMAT);
                state.hex = opaqueHex + alphaHex;
                state.rgb = rgbString;

                // Update ui.
                customProperty(alwan._reference._el(), COLOR, rgbString);
                _palette._update(state, updateAll);
                _utility._preview(rgbString);
                _sliders._update(state, opaqueHex, updateAll);
                _inputs._values(state);
            }
        },

        /**
         * Saves the current state.
         */
        _saveState() {
            savedColor = stringify(state, format);
        },

        /**
         * Compares the current color state with the saved state. if they are different,
         * then dispatch a change event.
         *
         * @param {Element} source - Event source.
         */
        _triggerChange(source) {
            if (savedColor !== stringify(state, format)) {
                alwan._events._dispatch(CHANGE, source);
            }
        },

        /**
         * Sets a new color.
         *
         * @param {string|object} color - Color string or object.
         * @param {HTMLElement | undefined} source - Source element.
         */
        _set(color, source) {
            let [parsedColor, parsedColorFormat] = parseColor(color);
            let rgb, hsl;

            // Update color state if the current color and the given color are different.
            if (keys(parsedColor).some((channel) => parseColor[channel] !== state[channel])) {
                if (parsedColorFormat === RGB_FORMAT) {
                    rgb = parsedColor;
                    hsl = RGBToHSL(rgb);
                } else {
                    hsl = parsedColor;
                    hsl.S = parsedColor.s / 100;
                    hsl.L = parsedColor.l / 100;
                }

                this._update(hsl, source, true, rgb);
            }
        },

        /**
         * Gets color value.
         *
         * @returns {object} - Color value.
         */
        _value() {
            return {
                value: rgbString,
                rgb: asArray => colorData(RGB_FORMAT, asArray, rgbString),
                hsl: asArray => colorData(HSL_FORMAT, asArray),
                hex: () => stringify(state, HEX_FORMAT),
            }
        },

        /**
         * Sets a new color format.
         *
         * @param {string} newFormat - Color format.
         */
        _setFormat(newFormat) {
            format = config.format = newFormat;
        },

        /**
         * Gets current color as a string.
         *
         * @returns {string}
         */
        _get: () => stringify(state, format)
    }
}