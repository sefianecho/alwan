import { HSL_FORMAT, HSV_FORMAT, RGB_FORMAT } from "../constants";
import { createElement } from "../utils/dom";
import { float, isNumeric, normalizeAngle, numberRange, PI } from "../utils/number";
import { isString, trimString } from "../utils/string";
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

        format = [RGB_FORMAT, HSL_FORMAT, HSV_FORMAT].find(format => {
			return format.split('').every(key => {
				return isNumeric(value[key]);
			});
		});

        if (format) {
            if (! isset(value.a)) {
                value.a = 1;
            }

            if (format === HSV_FORMAT) {
                format = RGB_FORMAT;
                value = HSVToRGB({
                    h: normalizeAngle(value.h),
                    s: numberRange(value.s) / 100,
                    v: numberRange(value.v) / 100,
                    a: value.a
                });
            }

            str = stringify(value, format);
        }
    } else {
        str = trimString(value);
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