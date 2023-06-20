import { HSL_FORMAT, RGB_FORMAT } from "../constants/globals";
import { createElement } from "../utils/dom";
import { float, isNumeric, normalizeAngle, boundNumber, PI, round, int } from "../utils/number";
import { isString, trimString } from "../utils/string";
import { isset } from "../utils/util";
import { stringify } from "./stringify";

const ctx = createElement('canvas').getContext('2d');

/**
 * Regex.
 */
const HSL_REGEX = /^hsla?\(\s*([+-]?\d*\.?\d+)(\w*)?\s*[\s,]\s*([+-]?\d*\.?\d+)%?\s*,?\s*([+-]?\d*\.?\d+)%?(?:\s*[\/,]\s*([+-]?\d*\.?\d+)(%)?)?\s*\)?$/;
const HEX_REGEX = /^#[0-9a-f]{6}$/i;
/**
 * Used to convert non degrees angles to degrees.
 */
const ANGLE_COEFFICIENT_MAP = {
    deg: 1,
    turn: 360,
    rad: 180 / PI,
    grad: 0.9
}

/**
 * Parses any value into an RGB or HSL objects.
 * Invalid color values default to #000.
 *
 * @param {unknown} value - A value to parse.
 * @param {boolean} asString - Whether to return the result as a string or object.
 * @returns {object|string} - Parsed color as string or object.
 */
export const parseColor = (value = '', asString) => {

    let color;
    let format;
    let str = '';

    /**
     * Validate Non string values, convert color objects into strings.
     * Invalid values default to empty string.
     */
    if (! isString(value)) {

        format = [RGB_FORMAT, HSL_FORMAT].find(format => {
            return format.split('').every(key => {
                return isNumeric(float(value[key]));
            });
        });

        if (format) {
            str = stringify(value, format);
        }
    } else {
        str = value.trim();
    }

    /**
     * Parse strings
     */
    let [input, h, angle, s, l, a, percentage] = HSL_REGEX.exec(str) || [];

    // str is a hsl string.
    if (input) {
        /**
         * Normalize values.
         *
         * The hue value is so often given in degrees, it can be given as a number, however
         * it might has a unit 'turn', 'rad' (radians) or 'grad' (gradients),
         * If the hue has a unit other than deg, then convert it to degrees.
         */
        color = {
            h: normalizeAngle(h * (ANGLE_COEFFICIENT_MAP[angle] ? ANGLE_COEFFICIENT_MAP[angle] : 1)),
            s: round(boundNumber(s)),
            l: round(boundNumber(l)),
            a: isset(a) ? boundNumber(percentage ? a / 100 : a, 1) : 1
        }
        format = HSL_FORMAT;
    } else {
        format = RGB_FORMAT;

        ctx.fillStyle = '#000';
        ctx.fillStyle = str;
        str = ctx.fillStyle;
        // ColorString is either hex or rgb string,
        // if it's hex convert it to rgb object,
        // if it's rgb then parse it to object.
        if (HEX_REGEX.test(str)) {
            // Convert hex string to rgb object.
            color = {
                r: int(str.slice(1, 3), 16),
                g: int(str.slice(3, 5), 16),
                b: int(str.slice(5, 7), 16),
                a: 1
            }
        } else {
            // Parse rgb string into a rgb object.
            const [r, g, b, a] = /\((.+)\)/.exec(str)[1].split(',').map(value => float(value));
            color = { r, g, b, a };
        }
    }

    // Round the transparency component to two numbers behind
    color.a = round(color.a * 100) / 100;

    return asString ? stringify(color, format) : [color, format];
}