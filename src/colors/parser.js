import { HSL_FORMAT, RGB_FORMAT } from "../constants";
import { createElement } from "../utils/dom";
import { float, normalizeAngle, numberRange, PI } from "../utils/number";
import { trimString } from "../utils/string";
import { isset } from "../utils/util";
import { HEXToRGB } from "./converter";
import { stringify } from "./stringify";

const ctx = createElement('canvas').getContext('2d');

/**
 * Regex.
 */
const HSL_REGEX = /^hsla?\(\s*([+-]?\d*\.?\d+)(\w*)?\s*[\s,]\s*([+-]?\d*\.?\d+)%?\s*,?\s*([+-]?\d*\.?\d+)%?(?:\s*[\/,]\s*([+-]?\d*\.?\d+)(%)?)?\s*\)?$/;
const HEX_REGEX = /^#[0-9a-f]{6}$/i;

const ANGLE_COEFFICIENT_MAP = {
    deg: 1,
    turn: 360,
    rad: 180 / PI,
    grad: 0.9
}

/**
 * Parses a string.
 *
 * @param {string} str - A string to parse.
 * @param {boolean} asString - Whether to return the result as a string or object.
 * @returns {object|string} - Parsed color as string or object.
 */
export const parseColor = (str, asString) => {
    str = trimString(str);

    let color;
    let format;
    let [input, h, angle, s, l, a, percentage] = HSL_REGEX.exec(str) || [];

    // str is a hsl string.
    if (input) {
        /**
         * Normalize values.
         *
         * The hue value is so often given in degrees, it can be given as a number, however
         * it might has a unit 'turn', 'rad' (radians) or 'grad' (gradians),
         * If the hue has a unit other than deg, then convert it to degrees.
         */
        color = {
            h: normalizeAngle(h * (ANGLE_COEFFICIENT_MAP[angle] ? ANGLE_COEFFICIENT_MAP[angle] : 1)),
            s: numberRange(s),
            l: numberRange(l),
            a: isset(a) ? numberRange(percentage ? a / 100 : a, 1) : 1
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
            color = HEXToRGB(str);
        } else {
            let [r, g, b, a] = /\((.+)\)/.exec(str)[1].split(',').map(value => float(value));
            color = { r, g, b, a };
        }
    }

    return asString ? stringify(color, format) : { _format: format, _color: color }
}