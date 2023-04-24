import { HEX_FORMAT, RGB_FORMAT } from "../constants/globals";
import { round } from "../utils/number.js";

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
 * Converts RGB or HSL color objects to string.
 *
 * @param {object} color - HSL or RGB color object.
 * @param {string} format - Color format (hex, rgb or hsl).
 * @param {boolean} opaque - If true, output color string with no opacity.
 * @returns {string} rgb or hsl string.
 */
export const stringify = (color, format, opaque) => {
    let opacity = '';
    let a = color.a;
    let str = format;

    if (a < 1 && ! opaque) {
        str += 'a';
        opacity = ', ' + a;
    }

    if (format === RGB_FORMAT) {
        return str + `(${color.r}, ${color.g}, ${color.b + opacity})`;
    }

    if (format === HEX_FORMAT) {
        return '#' + toHex(color.r) + toHex(color.g) + toHex(color.b) + (a < 1 ? toHex(round(a * 255)) : '');
    }

    return str + `(${color.h}, ${color.s}%, ${color.l}%${opacity})`;
}