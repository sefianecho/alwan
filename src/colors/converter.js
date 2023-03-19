import { int, max, min, normalizeAngle, round } from "../utils/number";

/**
 * Helper function used for converting HSV to RGB.
 *
 * @param {number} k - Positive coefficient.
 * @param {number} s - Saturation.
 * @param {number} v - Value.
 * @returns {number}
 */
const fn = (k, s, v) => {
    return (v - v * s * max(0, min(k, 4 - k, 1))) * 255;
}

/**
 * Converts HSV to RGB.
 *
 * @param {object} param0 - HSV color object.
 * @returns {object} - RGB color object.
 */
export const HSVToRGB = ({ h, s, v, a }) => {
    h /= 60;
    return {
        r: round(fn((5 + h) % 6, s, v)),
        g: round(fn((3 + h) % 6, s, v)),
        b: round(fn((1 + h) % 6, s, v)),
        a
    }
}


/**
 * Converts hex color string to RGB object.
 *
 * @param {string} hex - Hexadecimal color.
 * @returns {object} - RGB color object.
 */
export const HEXToRGB = hex => {
    return {
        r: int(hex.slice(1, 3), 16),
        g: int(hex.slice(3, 5), 16),
        b: int(hex.slice(5, 7), 16),
        a: 1
    }
}

/**
 * Converts a decimal number to hexadecimal.
 *
 * @param {number} number - A decimal number.
 * @returns {string} - Hexadecimal.
 */
const toHex = number => {
    return (number < 16 ? '0' : '') + number.toString(16);
}


/**
 * Converts RGB object to Hex string.
 *
 * @param {object} param0 - RGB color object.
 * @returns {string} - Hex color.
 */
export const RGBToHEX = ({ r, g, b, a }) => {
    return '#' + toHex(r) + toHex(g) + toHex(b) + (a < 1 ? toHex(round(a * 255)) : '');
}


/**
 * Converts HSV to HSL.
 *
 * @param {object} param0 - HSV color object.
 * @returns {object} - HSL object.
 */
export const HSVToHSL = ({ h, s, v, a }) => {
    // Lightness value.
    s = v * (1 - s / 2);

    return {
        h,
        s: round((! s || s === 1 ? 0 : (v - s) / min(s, 1 - s)) * 100),
        l: round(s * 100),
        a: round(a * 100) / 100
    }
}


/**
 * Converts HSL to HSV.
 *
 * @param {Object} hsl - HSL color object.
 * @returns {Object}
 */
export const HSLToHSV = ({ h, s, l, a }) => {
    l /= 100;
    // Value.
    s = l + s * min(l, 1 - l) / 100;

    return {
        h,
        s: s ? 2 * (1 - l / s) : 0,
        v: s,
        a
    }
}


/**
 * Converts RGB to HSV.
 *
 * @param {Object} rgb - RGB color object.
 * @returns {Object}
 */
export const RGBToHSV = ({ r, g, b, a }) => {

    r /= 255;
    g /= 255;
    b /= 255;

    let cMax = max(r, g, b);
    let cMin = min(r, g, b);
    let range = cMax - cMin;
    let h = range === 0 ? 0
            : cMax === r ? ((g - b) / range) % 6
            : cMax === g ? ((b - r) / range) + 2
            : cMax === b ? ((r - g) / range) + 4
            : 0;

    return {
        h: normalizeAngle(h * 60),
        s: cMax ? range / cMax : 0,
        v: cMax,
        a: round(a * 100) / 100
    }
}