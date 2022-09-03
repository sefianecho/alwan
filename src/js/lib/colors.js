import { HSL_FORMAT, max, min, round } from "../constants";
import { isString } from "../utils/util";

/**
 * Convert HSV to RGB.
 *
 * @param {Object} hsv - HSV color object.
 * @returns {Object}
 */
export const HSVToRGB = hsv => {

    let H = hsv.h / 60,
        S = hsv.s,
        V = hsv.v;

    /**
     * Helper function used for converting HSV to RGB.
     *
     * @param {Number} k - Positive Coefficient.
     * @param {Number} s - hSV Saturation.
     * @param {Number} v - HSV Value.
     * @returns {Number}
     */
    let fn = (k, s, v) => (v - v * s * max(0, min(k, 4 - k, 1))) * 255;

    return {
        r: round(fn((5 + H) % 6, S, V)),
        g: round(fn((3 + H) % 6, S, V)),
        b: round(fn((1 + H) % 6, S, V)),
        a: hsv.a
    }
}


/**
 * Convert RGB or HSL color objects to string.
 *
 * @param {Object} color  - Color Object.
 * @param {string} format - Color format.
 * @returns {string}
 */
export const toString = (color, format) => {

    let colorString = color;

	if (! isString(color)) {

        let a = '',
            opacity = '',
            comma = ', ';
    
        if (color.a < 1) {
            a = 'a';
            opacity = comma + color.a;
        }

        let percent = format === HSL_FORMAT ? '%' : '';
		colorString = format + a + '(' + color[format[0]] + comma + color[format[1]] + percent + comma + color[format[2]] + percent + opacity + ')';
	}

    return colorString;
}