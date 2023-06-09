import { parseColor } from "../colors/parser";
import { stringify } from "../colors/stringify";
import { CHANGE, COLOR_PROPERTY, HEX_FORMAT, HSL_FORMAT, RGB_FORMAT } from "../constants/globals";
import { setCustomProperty } from "../utils/dom";
import { abs, max, min, normalizeAngle, round } from "../utils/number.js";
import { merge, objectIterator } from "../utils/object";

/**
 * Creates the core color state and UI updater.
 *
 * @param {object} alwan - Alwan instance.
 * @returns {object} Core color state.
 */
export const color = (alwan) => {

    /**
     * RGB string used to update UI.
     *
     * @type {string}
     */
    let rgbString;

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
        a: 1
    }

    /**
     * Alwan options.
     */
    const config = alwan.config;

    /**
     * Updates the hsl values from a RGB object.
     *
     * @param {object} rgb - RGB color object.
     */
    const updateHSLFromRGB = (rgb) => {

        let { r, g, b } = rgb;
        let cMax, cMin, d, l, h;

        r /= 255;
        g /= 255;
        b /= 255;

        cMax = max(r, g, b);
        cMin = min(r, g, b);
        d = cMax - cMin;
        l = (cMax + cMin) / 2;

        h = d === 0 ?
                    0
                : cMax === r ? (g - b) / d % 6
                : cMax === g ? (b - r) / d + 2
                : cMax === b ? (r - g) / d + 4
                : 0;

        // Merge rgb object and the converted HSL into the state.
        merge(state, rgb, {
            h: normalizeAngle(h * 60),
            S: d ? d / (1 - abs(2 * l - 1)) : 0,
            L: l
        });
    }

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

    /**
     * Helper function used for converting HSL to RGB.
     *
     * @param {number} k - Positive coefficient.
     * @param {number} s - HSL saturation.
     * @param {number} l - HSL lightness.
     * @returns {number} - RGB component.
     */
    const fn = (k, s, l) => {
        k %= 12;
        return round((l - s * min(l, 1 - l) * max(-1, min(k - 3, 9 - k, 1))) * 255);
    }


    return {
        /**
         * Updates color state and the UI components.
         *
         * @param {object} hsl - HSL color object.
         * @param {boolean} all - Whether to update the rest of the components (palette and sliders).
         * @param {boolean} isInputs - If true don't update inputs.
         * @param {boolean} isRGB - Color state changed from a RGB color.
         */
        _update(hsl, all, isInputs, isRGB) {
            if (! config.disabled) {

                merge(state, hsl);

                let { h, S, L } = state;
                let { _app: { _root }, _inputs, _palette, _sliders } = alwan._components;

                if (! isRGB) {
                    // Update rgb channels.
                    h /= 30;
                    state.r = fn(h, S, L);
                    state.g = fn(h + 8, S, L);
                    state.b = fn(h + 4, S, L);
                }

                state.s = round(S * 100);
                state.l = round(L * 100);

                rgbString = stringify(state, RGB_FORMAT);

                // Update ui.
                setCustomProperty(alwan._reference._element, COLOR_PROPERTY, rgbString);
                setCustomProperty(_root, '--h', state.h);
                setCustomProperty(_root, '--rgb', stringify(state, RGB_FORMAT, true));
                setCustomProperty(_root, COLOR_PROPERTY, rgbString);

                // Update Inputs.
                if (! isInputs) {
                    _inputs._update(config.singleInput || format === HEX_FORMAT ? { [format]: stringify(state, format) } : state);
                }

                // Update palette's marker position and sliders values.
                if (all) {
                    _palette._update(state);
                    _sliders._update(state);
                }
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
         * then dipatch a change event.
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
         * @param {boolean} isInputs - If true, inputs values don't get updated.
         */
        _set(color, isInputs = false) {
            let { _format, _color } = parseColor(color);
            let isChanged = false;
            let isRGB = _format === RGB_FORMAT;
            let hsl;

            // Compare parsed color channels (components) to the color state,
            // channels.
            objectIterator(_color, (value, channel) => {
                if (value !== state[channel]) {
                    isChanged = true;
                }
            });

            if (isChanged) {
                if (isRGB) {
                    updateHSLFromRGB(_color);
                } else {
                    hsl = {
                        h: _color.h,
                        S: _color.s / 100,
                        L: _color.l / 100,
                        a: _color.a
                    }
                }

                this._update(hsl, true, isInputs, isRGB);
            }

            return isChanged;
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