import { HSL_FORMAT } from "../constants";

/**
 * Converts RGB or HSL color objects to string.
 *
 * @param {object} color - HSL or RGB color object.
 * @param {string} format - hsl or rgb.
 * @returns {string} rgb or hsl string.
 */
export const stringify = (color, format, opaque) => {
    let percentage = '';
    let opacity = '';
    let a = color.a;

    if (format === HSL_FORMAT) {
        percentage = '%';
    }

    if (a < 1 && ! opaque) {
        format += 'a';
        opacity = ', ' + a;
    }

    return `${format}(${color[format[0]]}, ${color[format[1]] + percentage}, ${color[format[2]] + percentage + opacity})`;
}