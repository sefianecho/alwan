import { RGBToHSL } from "./converter";
import { DEFAULT_COLOR, HSL_FORMAT, RGB_FORMAT } from "./constants";
import { stringify } from "./stringify";
import { Color, HSLA, RGBA } from "./types";
import { createElement } from "./utils/dom";
import { isNumber, isString } from "./utils";
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
    color: Color,
    opacity?: boolean,
    toString?: boolean,
): [HSLA, RGBA | undefined] | string => {
    let rgb: RGBA | undefined;
    let hsl: HSLA | undefined;
    let str = "";

    if (isString(color)) {
        str = color.trim();
    } else if (isPlainObject(color)) {
        [RGB_FORMAT, HSL_FORMAT].some(
            (format) =>
                [...format].every((key) =>
                    isNumber(color[key as keyof Color]),
                ) &&
                (str = stringify(color as HSLA | RGBA, format === HSL_FORMAT)),
        );
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
            const [r, g, b, a] = str.match(/\d+\.?\d*/g)!.map(Number);
            rgb = { r, g, b, a };
        }

        hsl = RGBToHSL(rgb);
    }
    hsl.a = opacity ? round(hsl.a * 100) / 100 : 1;
    if (rgb) {
        rgb.a = hsl.a;
    }

    if (toString) {
        return stringify(rgb || hsl, !rgb);
    }

    return [hsl, rgb];
};
