import { BODY, CHANGE, COLOR_PROPERTY, HEX_FORMAT, HSL_FORMAT, HSV_FORMAT, INPUT, RGB_FORMAT, ROOT } from "../constants";
import { HSLToHSV, HSVToHSL, HSVToRGB, RGBToHEX, RGBToHSV, toString } from "../lib/colors";
import { parseColor } from "../lib/parser";
import { createElement, removeElement, setCustomProperty } from "../utils/dom";
import { isEqual, merge, objectIterator } from "../utils/object";
import { isset } from "../utils/util";

/**
 * Color state.
 *
 * @param {Object} alwan - Alwan instance.
 * @returns {Object}
 */
export const ColorState = (alwan) => {

    /**
     * HSV color object.
     */
    let HSV = {
        h: 0,
        s: 0,
        v: 0,
        a: 1
    }

    /**
     * RGB color object.
     */
    let RGB = HSVToRGB(HSV);

    /**
     * RGB string.
     */
    let rgbString = '';

    /**
     * Color object used for detecting a color change.
     */
    let colorStart;

    
    let { config, _e: event } = alwan;

    /**
     * Gets color object.
     *
     * @param {String} format - Color format.
     * @param {Boolean} asString - Get color as a string.
     * @returns {Object}
     */
    const getColorByFormat = (format, asString) => {
        format = format || config.format;

        let isHex = format === HEX_FORMAT;
        let color = isHex ? RGBToHEX(RGB)
                : format === HSL_FORMAT ? HSVToHSL(HSV, !asString)
                : RGB;

        return asString || isHex ? { [format]: toString(color, format) } : color;
    }

    /**
     * Outputs a color object.
     *
     * @param {Object} colorObject - RGB, HSL or HSV color object.
     * @param {String} colorString - Color string.
     * @param {String} format - Color format.
     * @param {Boolean} asArray - Output color values in an array.
     * @returns {Ojbect|Array}
     */
    const output = (colorObject, colorString, format, asArray) => {
        if (config.opacity) {
            format += 'a';
        }

        let output = asArray ? [] : {};

        if (format !== HSV_FORMAT) {
            output.toString = () => colorString || toString(colorObject, format);
        }

        /**
         * This puts colorObject values in an object or an array.
         *
         * @param {Object|Array} color - The output color.
         * @param {String} channel - Color channel.
         * @param {index} index - Array index.
         */
        return format.split('').reduce((color, channel, index) => {

            color[asArray ? index : channel] = colorObject[channel];

            return color;

        }, output);
    }

    return {
        /**
         * Updates color and UI.
         *
         * @param {Object} newHSV - HSV color object.
         * @param {Object|Boolean} updater - Exclude some components from updating.
         * @param {Object} rgb - RGB color object.
         */
        _update(newHSV, updater, rgb) {
            if (! config.disabled) {
                merge(HSV, newHSV);
                RGB = rgb || HSVToRGB(HSV);
                rgbString = toString(RGB, RGB_FORMAT);
        
                let components = alwan._c;
                let { palette, sliders, inputs } = components;
        
                // Preview color.
                setCustomProperty(components.preview.$, COLOR_PROPERTY, rgbString);
                setCustomProperty(components.ref.$, COLOR_PROPERTY, rgbString);
                // Change the gradient color stop of the alpha slider.
                (updater || ! isset(newHSV.a)) && setCustomProperty(sliders.alpha, RGB_FORMAT, RGB.r + ',' + RGB.g + ',' + RGB.b);
                // Set palette's hue.
                isset(newHSV.h) && setCustomProperty(palette.$, 'hue', HSV.h);
    
                if (updater !== inputs) {
                    inputs._setValue( getColorByFormat('', config.singleInput) );
                }
    
                if (updater) {
                    sliders._setValue(HSV);
                    palette._setMarkerPosition(HSV);
                }
            }
        },

         /**
         * Updates color by a string instead of HSV object.
         *
         * @param {String} colorString - Color string.
         * @param {Boolean|Object} updater - Exclude some components from updating.
         */
        _updateFromString(colorString, updater) {

            let { _color: parsedColor, _format: format } = parseColor(colorString);
            let currentColor = getColorByFormat(format);
            let isChanged = ! isEqual(parsedColor, currentColor);
            let rgb, hsv;

            if (isChanged) {

                if (format === HSL_FORMAT) {
                    hsv = HSLToHSV(parsedColor);
                } else {
                    rgb = parsedColor;
                    hsv = RGBToHSV(parsedColor);
                }

                this._update(hsv, updater, rgb);
            }

            return isChanged;
        },

        /**
         * Copies color to the clipboard.
         *
         * @returns {Boolean}
         */
        _copyColor() {
            objectIterator(getColorByFormat('', true), color => {
                let clipboard = navigator.clipboard;
        
                if (clipboard) {
                    clipboard.writeText(color);
                } else {
                    // Incase browser doesn't support navigator.clipboard,
                    // Create a new input element and append it to the body,
                    // set its value as the color.
                    createElement(INPUT, '', BODY, null, input => {
        
                        input.value = color;
                        input.select();
                        ROOT.execCommand('copy');
        
                        // Color text is copied so remove the input.
                        removeElement(input);
                    });
                }
            });
        },

        /**
         * Picker value.
         */
        _colorOutput: {
            [HSV_FORMAT]: () => output(HSV, '', HSV_FORMAT, false),
            [RGB_FORMAT]: asArray => output(RGB, rgbString, RGB_FORMAT, asArray),
            [HSL_FORMAT]: asArray => output(HSVToHSL(HSV), '', HSL_FORMAT, asArray),
            [HEX_FORMAT]: () => RGBToHEX(RGB)
        },
        
        /**
         * Set color start.
         */
        _colorStart() {
            colorStart = getColorByFormat();
        },

        /**
         * Triggers change event if colorStart doesn't equal to the current color.
         *
         * @param {Element} source - Element that changed color state.
         */
        _triggerChange(source) {
            if (! isEqual(colorStart, getColorByFormat())) {
                event._emit(CHANGE, source);
            }
        }
    }
}