import { RGBToHSL } from "./converter";
import { DEFAULT_COLOR, HSL_FORMAT, RGB_FORMAT } from "./constants";
import { HSLA, RGBA } from "./types";
import { createElement } from "./utils/dom";
import { isNumber, isString } from "./utils";
import { PI, clamp, normalizeAngle, round, toDecimal } from "./utils/math";
import { stringify } from "./stringify";
import { isPlainObject } from "./utils/object";

const ctx = createElement("canvas").getContext("2d")!;

const ANGLE_COEFFICIENT_MAP: { [angle: string]: number } = {
    turn: 360,
    rad: 180 / PI,
    grad: 0.9,
};

const HSL_REGEX =
    /a?\(\s*([+-]?\d*\.?\d+)(\w*)?\s*[\s,]\s*([+-]?\d*\.?\d+)%?\s*,?\s*([+-]?\d*\.?\d+)%?(?:\s*[\/,]\s*([+-]?\d*\.?\d+)(%)?)?\s*\)?$/;

const getFormatFromObj = (value: unknown) =>
    (isPlainObject(value) &&
        [HSL_FORMAT, RGB_FORMAT].find((format) =>
            [...format].every((channel) =>
                isNumber(value[channel as keyof typeof value]),
            ),
        )) ||
    "";

export const normalizeColor = (value: unknown): string => {
    return isString(value)
        ? value
        : stringify(value as RGBA | HSLA, getFormatFromObj(value));
};

// Invalid color strings defaults to DEFAULT_COLOR.
export const normalizeColorStr = (str: string) => {
    ctx.fillStyle = DEFAULT_COLOR;
    ctx.fillStyle = str;
    return ctx.fillStyle;
};

export const parseColor = (
    color: unknown,
    opacity?: boolean,
): [HSLA, RGBA | undefined] => {
    let rgb: RGBA | undefined;
    let hsl: HSLA | undefined;
    let colorStr = normalizeColor(color).trim();

    if (/^hsl/.test(colorStr)) {
        const [isHSL, h, angle, s, l, a = "1", percentage] =
            HSL_REGEX.exec(colorStr) || [];
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
        if (/^[\da-f]+$/i.test(colorStr)) {
            colorStr = "#" + colorStr;
        }

        colorStr = normalizeColorStr(colorStr);

        if (colorStr[0] === "#") {
            rgb = {
                r: toDecimal(colorStr[1] + colorStr[2]),
                g: toDecimal(colorStr[3] + colorStr[4]),
                b: toDecimal(colorStr[5] + colorStr[6]),
                a: 1,
            };
        } else {
            const [r, g, b, a] = colorStr.match(/[\d\.]+/g)!.map(Number);
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
