import { RGB_FORMAT } from "../constants/globals";

/**
 * Converts RGB or HSL color objects to string.
 *
 * @param {object} color - HSL or RGB color object.
 * @param {string} format - Color format (hex, rgb or hsl).
 * @returns {string} rgb or hsl string.
 */
export const stringify = (color, format) => {
    let opacity = '';
    let a = color.a;
    let str = format;

    if (a < 1) {
        str += 'a';
        opacity = ', ' + a;
    }

    if (format === RGB_FORMAT) {
        return str + `(${color.r}, ${color.g}, ${color.b + opacity})`;
    }

    return str + `(${color.h}, ${color.s}%, ${color.l}%${opacity})`;
}