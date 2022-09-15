import { float, HSL_FORMAT, RGB_FORMAT, round } from "../constants";
import { createElement } from "../utils/dom";
import { boundNumber } from "../utils/util";
import { HEXToRGB, toString } from "./colors";

const ctx = createElement('canvas').getContext('2d');
const HSL_REGEX = /^hsla?\(\s*([+-]?\d*\.?\d+)(\w*)?(?:(?:\s+([+-]?\d*\.?\d+)%\s*([+-]?\d*\.?\d+)%(?:\s*\/\s*([+-]?\d*\.?\d+%?))?)|(?:\s*,\s*([+-]?\d*\.?\d+)%\s*,\s*([+-]?\d*\.?\d+)%(?:\s*,\s*([+-]?\d*\.?\d+%?))?))\s*\)?$/i;
const HEX_REGEX = /^#[0-9a-f]{6}$/i;


/**
 * Parses a color string.
 *
 * @param {String} colorString - Color string.
 * @param {Boolean} asString - Return color as a string or object.
 * @returns {Object}
 */
export const parseColor = (colorString, asString) => {

    let _color;
    let _format;

    colorString = colorString.trim();
    /**
     * Parse hsl.
     * No need to parse it if it's shorter than the minimum hsl string length,
     * the minimum is 10 characters, e.g. hsl(0 0%0%.
     */
    if (colorString.length >= 10) {

        const channels = colorString.match(HSL_REGEX);

        if (channels) {
            let h = float(channels[1]),
                angle = channels[2],
                s = boundNumber(channels[3] || channels[6]),
                l = boundNumber(channels[4] || channels[7]),
                a = channels[5] || channels[8];

            /**
             * The hue value is so often given in degrees, it can be given as a number, however
             * it might has a unit 'turn', 'rad' (radians) or 'grad' (gradians),
             * If the hue has a unit other than deg, then convert it to degrees.
             */
            h *= angle === 'turn' ? 360
                : angle === 'rad' ? 180 / PI
                : angle === 'grad' ? 0.9
                : 1;

            // Make sure hue is between 0 and 360.
            let maxAngle = 360;
            h = (round(h) % maxAngle + maxAngle) % maxAngle;

            // Alpha value must be between 0 and 1.
            a = a ? boundNumber(a.slice(-1) === '%' ? float(a) / 100 : a, 1) : 1;

            _color  = { h, s, l, a };
            _format = HSL_FORMAT;
        }
    }

    // colorString is not an HSL string.
    if (! _color) {

        ctx.fillStyle = '#000';
        ctx.fillStyle = colorString;
        colorString = ctx.fillStyle;
        // ColorString is either hex or rgb string,
        // if it's hex convert it to rgb object,
        // if it's rgb then parse it to object.
        if (HEX_REGEX.test(colorString)) {
            _color = HEXToRGB(colorString);
        } else {
            // Parse RGB string.
            let [r, g, b, a] = colorString.match(/\((.+)\)/)[1]
                                          .split(',')
                                          .map(value => float(value));

            _color = {
                r,
                g,
                b,
                a: a ? round(a * 100) / 100 : 1,
            }
        }

        _format = RGB_FORMAT;
    }

    return asString ? toString(_color, _format) : { _color, _format };
}