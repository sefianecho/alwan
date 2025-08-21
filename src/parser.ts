import { RGBToHSL } from "./converter";
import { DEFAULT_COLOR } from "./constants";
import { stringify } from "./stringify";
import { HSLA, RGBA, colorFormat } from "./types";
import { createElement } from "./utils/dom";
import { getColorObjectFormat, isString } from "./utils";
import { PI, clamp, normalizeAngle, round, toDecimal } from "./utils/math";
import { isPlainObject } from "./utils/object";

const ctx = createElement("canvas").getContext("2d")!;

const ANGLE_COEFFICIENT_MAP: { [angle: string]: number } = {
    turn: 360,
    rad: 180 / PI,
    grad: 0.9,
};

const HSL_REGEX =
    /a?\(\s*([+-]?\d*\.?\d+)(\w*)?\s*[\s,]\s*([+-]?\d*\.?\d+)%?\s*,?\s*([+-]?\d*\.?\d+)%?(?:\s*[\/,]\s*([+-]?\d*\.?\d+)(%)?)?\s*\)?$/;

export const parseColor = (
    color: unknown,
    opacity?: boolean,
): [HSLA, RGBA | undefined] => {
    let rgb: RGBA | undefined;
    let hsl: HSLA | undefined;
    let format: colorFormat | undefined;
    let str = "";

    if (isString(color)) {
        str = color.trim();
    } else if (isPlainObject(color)) {
        format = getColorObjectFormat(color);
        if (format) {
            str = stringify(color as HSLA | RGBA, format);
        }
    }

    if (/^hsl/.test(str)) {
        const [isHSL, h, angle, s, l, a = "1", percentage] =
            HSL_REGEX.exec(str) || [];
        if (isHSL) {
            hsl = {
                h: normalizeAngle(+h * (ANGLE_COEFFICIENT_MAP[angle] || 1)),
                s: clamp(+s),
                l: clamp(+l),
                a: clamp(+a / (percentage ? 100 : 1), 1),
            };
        }
    }

    if (!hsl) {
        // # is optional.
        if (/^[\da-f]+$/i.test(str)) {
            str = "#" + str;
        }

        ctx.fillStyle = DEFAULT_COLOR;
        ctx.fillStyle = str;
        str = ctx.fillStyle;

        if (str[0] === "#") {
            rgb = {
                r: toDecimal(str[1] + str[2]),
                g: toDecimal(str[3] + str[4]),
                b: toDecimal(str[5] + str[6]),
                a: 1,
            };
        } else {
            const [r, g, b, a] = str.match(/[\d\.]+/g)!.map(Number);
            rgb = { r, g, b, a };
        }

        hsl = RGBToHSL(rgb);
    }
    hsl.a = opacity ? round(hsl.a * 100) / 100 : 1;
    if (rgb) {
        rgb.a = hsl.a;
    }

    return [hsl, rgb];
};
