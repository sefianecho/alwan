import { BODY, HEX_FORMAT, HSL_FORMAT, HSV_FORMAT, RGB_FORMAT, ROOT } from "../constants";
import { HSLToHSV, HSVToHSL, HSVToRGB, RGBToHEX, RGBToHSV, toString } from "../lib/colors";
import { parseColor } from "../lib/parser";
import { createElement, removeElement, setCustomProperty } from "../utils/dom";
import { isEqual, merge, objectIterator } from "../utils/object";
import { isset } from "../utils/util";

/**
 * Color state.
 *
 * @param {Object} talwin - Talwin instance.
 * @returns {Object}
 */
export const Color = (talwin) => {

    let HSV = {
        h: 0,
        s: 0,
        v: 0,
        a: 1
    }

    let RGB = HSVToRGB(HSV);

    let rgbString = '';

    let { config, _e: event } = talwin;

    let colorStart;


    /**
     * Updates color and UI.
     *
     * @param {Object} newHSV - HSV color object.
     * @param {Object|Boolean} updater - Exclude some components from updating.
     * @param {Object} rgb - RGB color object.
     */
    const update = (newHSV, updater, rgb) => {
        if (! config.disabled) {
            merge(HSV, newHSV);
            RGB = rgb || HSVToRGB(HSV);
            rgbString = toString(RGB, RGB_FORMAT);
    
            let components = talwin._ui;
            let { palette, sliders, inputs } = components;
    
            // Preview color.
            setCustomProperty(components.preview.$, 'tw-color', rgbString);
            setCustomProperty(components.ref.$, 'tw-color', rgbString);
            // Change the gradient color stop of the alpha slider.
            (updater || ! isset(newHSV.a)) && setCustomProperty(sliders.alpha, RGB_FORMAT, RGB.r + ',' + RGB.g + ',' + RGB.b);
            // Set palette's hue.
            isset(newHSV.h) && setCustomProperty(palette.$, 'hue', HSV.h);
    
            if (updater !== inputs) {
                inputs.val(getColor('', config.singleInput));
            }
    
            if (updater) {
                sliders.val(HSV);
                palette.update(HSV);
            }
        }
    }

    /**
     * Gets color object.
     *
     * @param {String} format - Color format.
     * @param {Boolean} asString - Get color as a string.
     * @returns {Object}
     */
    const getColor = (format, asString) => {
        format = format || config.format;

        let isHex = format === HEX_FORMAT;
        let color = isHex ? RGBToHEX(RGB)
                : format === HSL_FORMAT ? HSVToHSL(HSV, !asString)
                : RGB;

        return asString || isHex ? { [format]: toString(color, format) } : color;
    }


    /**
     * Updates color by a string instead of HSV object.
     *
     * @param {String} colorString - Color string.
     * @param {Boolean} fromInput - String comming from the picker input fields.
     */
    const updateByString = (colorString, updater) => {

        let { c: parsedColor, f: format } = parseColor(colorString);
        let currentColor = getColor(format);
        let isChanged = ! isEqual(parsedColor, currentColor);
        let rgb, hsv;

        if (isChanged) {

            if (format === HSL_FORMAT) {
                hsv = HSLToHSV(parsedColor);
            } else {
                rgb = parsedColor;
                hsv = RGBToHSV(parsedColor);
            }

            update(hsv, updater, rgb);
        }

        return isChanged;
    }

    /**
     * Copies color to the clipboard.
     *
     * @returns {Boolean}
     */
    const copy = () => objectIterator(getColor('', true), color => {

            let clipboard = navigator.clipboard;

            if (clipboard) {
                clipboard.writeText(color);
            } else {
                // Incase browser doesn't support navigator.clipboard,
                // Create a new input element and append it to the body,
                // set its value as the color.
                createElement('input', '', BODY, null, input => {

                    input.value = color;
                    input.select();
                    ROOT.execCommand('copy');

                    // Color text is copied so remove the input.
                    removeElement(input);
                });
            }
        });

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
        return format.split('').reduce((color, channel, index) =>
                (color[asArray ? index : channel] = colorObject[channel]) && color, output);
    }

    /**
     * Picker value.
     */
    const value = {
        HSV: () => output(HSV, '', HSV_FORMAT, false),
        RGB: asArray => output(RGB, rgbString, RGB_FORMAT, asArray),
        HSL: asArray => output(HSVToHSL(HSV), '', HSL_FORMAT, asArray),
        HEX: () => RGBToHEX(RGB)
    }

    /**
     * Set color start.
     */
    const start = () => {
        colorStart = getColor();
    }

    /**
     * Triggers change event if colorStart doesn't equal to the current color.
     *
     * @param {Element} source - Element that changed color state.
     */
    const end = (source) => {
        if (! isEqual(colorStart, getColor())) {
            event.emit('change', value, source);
        }
    }

    return {
        value,
        update,
        updateByString,
        copy,
        start,
        end,
    }
}