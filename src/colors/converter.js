import { abs, max, min, normalizeAngle, round } from "../utils/number";

/**
 * Converts a decimal number to hexadecimal.
 *
 * @param {number} number - A decimal number.
 */
const toHex = (number) => {
    return (number < 16 ? '0' : '') + number.toString(16);
};

/**
 * Converts RGB color to hex.
 *
 * returns an array of two values, the hex string without the alpha channel,
 * and the alpha channel (in hexadecimal).
 *
 * The hex without alpha (opaque) is used to color the background of the alpha slider.
 *
 * @param {object} param0 - RGB color object.
 */
export const RGBToHEX = ({ r, g, b, a }) => {
    return ['#' + toHex(r) + toHex(g) + toHex(b), a < 1 ? toHex(round(a * 255)) : ''];
};

/**
 * Helper function used for converting HSL to RGB.
 *
 * @param {number} k - Positive coefficient.
 * @param {number} s - HSL saturation.
 * @param {number} l - HSL lightness.
 */
export const fn = (k, s, l) => {
    k %= 12;
    return round((l - s * min(l, 1 - l) * max(-1, min(k - 3, 9 - k, 1))) * 255);
};

/**
 * Converts HSL to RGB.
 *
 * @param {object} param0 - HSL color components.
 */
export const HSLToRGB = ({ h, S, L }) => {
    h /= 30;
    return {
        r: fn(h, S, L),
        g: fn(h + 8, S, L),
        b: fn(h + 4, S, L),
    };
};

/**
 * Converts RGB to HSL.
 *
 * @param {object} param0 - RGB color object.
 * @returns {object} - HSL color object.
 */
export const RGBToHSL = ({ r, g, b, a }) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const cMax = max(r, g, b);
    const cMin = min(r, g, b);
    const d = cMax - cMin;
    const L = (cMax + cMin) / 2;
    const h =
        d === 0
            ? 0
            : cMax === r
            ? ((g - b) / d) % 6
            : cMax === g
            ? (b - r) / d + 2
            : cMax === b
            ? (r - g) / d + 4
            : 0;

    return {
        h: normalizeAngle(h * 60),
        S: d ? d / (1 - abs(2 * L - 1)) : 0,
        L,
        a,
    };
};