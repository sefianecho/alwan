import { EXCLUDE_INPUTS, EXCLUDE_PALETTE_HUE, HEX_FORMAT, HSL_FORMAT, ONLY_INPUTS, RGB_FORMAT } from "../constants";
import { HSLToHSV, HSVToHSL, HSVToRGB, RGBToHEX, RGBToHSV, toString } from "../lib/colors";
import { parseColor } from "../lib/parser";
import { setCustomProperty } from "../utils/dom";
import { isEqual, merge } from "../utils/object";

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

    let RGB;

    let rgbString = '';

    let config = talwin.config;

    /**
     * Updates color and UI.
     *
     * @param {Object} newHSV - HSV color object.
     * @param {Number} updater - A number indicates which component to update.
     * @param {Object} rgb - RGB color object.
     */
    const update = (newHSV, updater, rgb) => {

        merge(HSV, newHSV);
        RGB = rgb || HSVToRGB(HSV);
        rgbString = toString(RGB, RGB_FORMAT);

        let components = talwin._ui;
        let palette = components.palette;
        let sliders = components.sliders;

        // Preview color.
        setCustomProperty(components.preview.el, 'tw-color', rgbString);
        setCustomProperty(components.ref.$, 'tw-color', rgbString);

        if (updater !== ONLY_INPUTS) {
            // Change the gradient color stop of the alpha slider.
            setCustomProperty(sliders.alpha, RGB_FORMAT, RGB.r + ',' + RGB.g + ',' + RGB.b);
            
            if (updater !== EXCLUDE_PALETTE_HUE) {
                // Set palette's hue.
                setCustomProperty(palette.$, 'hue', HSV.h);
            }
        }

        if (updater !== EXCLUDE_INPUTS) {
            components.inputs.update(getColor('', config.singleInput));
        }

        if (! updater || updater === EXCLUDE_INPUTS) {
            // sliders.val(HSV);
            // palette.update(HSV);
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

        let color = format === HEX_FORMAT ? RGBToHEX(RGB)
                : format === HSL_FORMAT ? HSVToHSL(HSV)
                : RGB;

        return asString ? { [format]: toString(color, format) } : color;
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

    return {
        update,
        updateByString
    }
}