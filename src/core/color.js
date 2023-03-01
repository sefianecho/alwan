import { HSLToHSV, HSVToHSL, HSVToRGB, RGBToHEX, RGBToHSV } from "../colors/converter";
import { parseColor } from "../colors/parser";
import { stringify } from "../colors/stringify";
import { CHANGE, COLOR_PROPERTY, HEX_FORMAT, HSL_FORMAT, HSV_FORMAT, RGB_FORMAT } from "../constants";
import { setCustomProperty } from "../utils/dom";
import { isEqual, merge } from "../utils/object";

/**
 * Creates the core color state and UI updater.
 *
 * @param {object} alwan - Alwan instance.
 * @returns {object} Core color state.
 */
export const color = (alwan) => {
    /**
     * HSV color object.
     */
    let HSV = {
        h: 0,
        s: 0,
        v: 0,
        a: 1
    };

    /**
     * RGB color object.
     *
     * @type {object}
     */
    let RGB;

    /**
     * RGB color string.
     *
     * @type {string}
     */
    let rgbString;

    /**
     * Color state.
     *
     * @type{object}
     */
    let state;

    /**
     * Alwan options.
     */
    let config = alwan.config;

    /**
     * Gets color data.
     *
     * @param {object} color - Color object.
     * @param {string} format - Color format.
     * @param {boolean} asArray - Gets data as an array.
     * @param {string} str - Color string.
     * @returns {object} - Color data.
     */
    let colorData = (color, format, asArray, str) => {
        return merge(
            (format + (config.opacity ? 'a' : '')).split('').reduce((output, channel, index) => {
                output[asArray ? index : channel] = color[channel];
                return output;
            }, asArray ? [] : {}),

            format !== HSV_FORMAT ? { toString: () => str || stringify(color, format) } : {}
        )
    }

    /**
     * Value methods.
     */
    let value = {
        hsv: asArray => colorData(HSV, HSV_FORMAT, asArray),
        rgb: asArray => colorData(RGB, RGB_FORMAT, asArray, rgbString),
        hsl: asArray => colorData(HSVToHSL(HSV), HSL_FORMAT, asArray),
        hex: () => hex,
    };


    /**
     * Color api.
     */
    let self = {
        /**
         * Updates core color, css custom properties and inputs values.
         *
         * @param {object} hsv - HSV color object.
         * @param {object|undefined} rgb - RGB color object.
         * @param {boolean} isInputs - If true don't set inputs values.
         */
        _update(hsv, rgb, isInputs) {

            let { _palette, _sliders, _inputs, _utility } = alwan._components;

            if (! config.disabled) {
                hsv = hsv || HSV;
                merge(HSV, hsv);

                RGB = rgb || HSVToRGB(HSV);
                rgbString = stringify(RGB, RGB_FORMAT);

                // Update UI.
                setCustomProperty(alwan._reference._element, COLOR_PROPERTY, rgbString);
                setCustomProperty(_palette._element, '--hue', hsv.h);
                // Preview the current color.
                _utility._preview(rgbString);
                _sliders._sliderGradient(RGB);

                if (! isInputs) {
                    _inputs._setValue(self._getColorByFormat(config.singleInput));
                }
            }
        },

        /**
         * Same as update method plus it updates palette's marker position,
         * and sliders values.
         *
         * @param {object} hsv - HSV color object.
         * @param {object|undefined} rgb - RGB color object.
         * @param {boolean} isInputs - If true don't set inputs values.
         */
        _updateAll(hsv, rgb, isInputs) {
            let { _palette, _sliders } = alwan._components;
            self._update(hsv, rgb, isInputs);
            _palette._updateMarker(HSV);
            _sliders._setValue(HSV);
        },

        /**
         * Gets a color string or object by a format.
         *
         * @param {boolean} asString - Whether to get the color as a string.
         * @param {string} format - Color format.
         * @returns {object|string} - Color.
         */
        _getColorByFormat: (asString, format = config.format) => {
    
            if (format === RGB_FORMAT) {
                if (asString) {
                    return rgbString;
                }
                return RGB;
            }
    
            if (format === HSL_FORMAT) {
                if (asString) {
                    return stringify(HSVToHSL(HSV), HSL_FORMAT);
                }
                return HSVToHSL(HSV);
            }
    
            if (format === HEX_FORMAT) {
                return RGBToHEX(RGB);
            }
    
            return '';
        },

        /**
         * Save color state.
         */
        _saveState() {
            state = self._getColorByFormat();
        },

        /**
         * Compare the current color with the saved color, if they are different,
         * then dipatch a change event.
         *
         * @param {Element} source - Event source.
         */
        _triggerChange(source) {
            if (! isEqual(state, self._getColorByFormat())) {
                alwan._events._dispatch(CHANGE, source);
            }
        },

        /**
         * Sets color.
         *
         * @param {string|object} color - Color value.
         * @param {boolean} isInputs - Is inputs component.
         * @returns {boolean} - Whether the color state is changed or not.
         */
        _set(color, isInputs = false) {
            let { _format, _color } = parseColor(color);
            let isChanged = ! isEqual(_color, self._getColorByFormat(false, _format));
            let isRGB = _format === RGB_FORMAT;
    
            if (isChanged) {
                self._updateAll(
                    // Convert colors (RGB or HSL) to HSV.
                    isRGB ? RGBToHSV(_color) : HSLToHSV(_color),
                    // If the parsed color is RGB.
                    isRGB ? _color : false,
                    isInputs
                );
                
            }
    
            return isChanged;
        },

        /**
         * Creates and gets event object.
         *
         * @param {string} type - Event type.
         * @param {Element} src - Source element.
         * @returns {object} - Event object.
         */
        _event: (type, src) => {
            return merge(
                {
                    type,
                    src,
                    value: rgbString
                },
                value
            )
        },

        /**
         * Gets color value.
         *
         * @returns {object} - Color value.
         */
        _value: () => merge({ value: rgbString }, value),
    }

    return self;
}