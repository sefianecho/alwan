import { HSL_FORMAT, int, max, min, round } from "../constants";
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

/**
 * Converts hex color string to RGB color object.
 *
 * @param {string} hexColor - Hexadecimal color string.
 * @returns {Object}
 */
export const HEXToRGB = hexColor => ({
    r: int(hexColor.slice(1, 3), 16),
    g: int(hexColor.slice(3, 5), 16),
    b: int(hexColor.slice(5, 7), 16),
    a: 1
});


/**
 * Converts a decimal number to hexadecimal number.
 * The result must be two digits.
 *
 * @param {Number} number Decimal number.
 * @returns {string}
 */
const toHex = number => {
	let hexNumber = number.toString(16);
	return hexNumber.length < 2 ? '0' + hexNumber : hexNumber;
}


/**
 * Converts RGB color object to Hex string color.
 *
 * @param {Object} rgb - RGB color object.
 * @returns {String}
 */
export const RGBToHEX = ({ r, g, b, a }) => '#' + toHex(r) + toHex(g) + toHex(b) + (a < 1 ? toHex(round(a * 255)) : '');


/**
 * Converts HSV to HSL.
 *
 * @param {Object} hsv - HSV color object.
 * @returns {Object}
 */
export const HSVToHSL = (hsv) => {

    let v = hsv.v;
    let l = v * (1 - hsv.s / 2);
    let s = ! l || l === 1 ? 0 : (v - l) / min(l, 1 - l);

    return {
        h: hsv.h,
        s: round(s * 100),
        l: round(l * 100),
        a: round(hsv.a * 100) / 100
    }
}

/**
 * Converts HSL to HSV.
 *
 * @param {Object} hsl - HSL color object.
 * @returns {Object}
 */
export const HSLToHSV = (hsl) => {
	let s = hsl.s / 100,
		l = hsl.l / 100,
		v = l + s * min(l, 1 - l);
	
	return {
		h: hsl.h,
		s: v ? 2 * (1 - l / v) : 0,
		v,
		a: hsl.a
	}
}


/**
 * Converts RGB to HSV.
 *
 * @param {Object} rgb - RGB color object.
 * @returns {Object}
 */
export const RGBToHSV = rgb => {
	let R = rgb.r / 255,
		G = rgb.g / 255,
		B = rgb.b / 255,
		Cmax = max(R, G, B),
		Cmin = min(R, G, B),
		range = Cmax - Cmin,
		saturation = Cmax === 0 ? 0 : range / Cmax,
		hue = range === 0 ? 0
            : Cmax === R ? ((G - B) / range) % 6
            : Cmax === G ? ((B - R) / range) + 2
            : Cmax === B ? ((R - G) / range) + 4
            : 0;

	return {
		h: round( ( 360 + hue * 60 ) % 360 ),
		s: saturation,
		v: Cmax,
		a: round( rgb.a * 100 ) / 100
	}
}