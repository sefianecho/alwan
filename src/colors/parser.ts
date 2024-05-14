import {
	ANGLE_COEFFICIENT_MAP,
	DEFAULT_COLOR,
	HSL_FORMAT,
	HSL_REGEX,
	RGB_FORMAT,
} from "../constants/globals";
import type { Color, HSLA, RGBA, colorFormat } from "../types";
import { createElement } from "../utils/dom";
import { isHex, isNumber, isString } from "../utils/is";
import { clamp, int, normalizeAngle, round } from "../utils/math";
import { isPlainObject } from "../utils/object";
import { stringify } from "./stringify";

const ctx = createElement("canvas").getContext("2d")!;

/**
 * Parses any value into an RGB or HSL objects.
 * Invalid values default to DEFAULT_COLOR in globals.
 */
export function parseColor(color: Color, asString: true): string;
export function parseColor(
	color: Color,
	asString?: false,
): [RGBA | HSLA, colorFormat, string];
export function parseColor(
	color: Color,
	asString?: boolean,
): string | [RGBA | HSLA, colorFormat, string] {
	let format: colorFormat | undefined;
	let parsedColor: HSLA | RGBA;
	let str: string = "";

	if (isString(color)) {
		str = color.trim();
	} else {
		if (isPlainObject(color)) {
			format = [RGB_FORMAT, HSL_FORMAT].find((format) =>
				format
					.split("")
					.every((key) => isNumber(color[key as keyof Color])),
			);
			if (format) {
				str = stringify(color as RGBA | HSLA, format);
			}
		}
	}

	const [isHSL, h, angle, s, l, a = "1", percentage] =
		HSL_REGEX.exec(str) || [];

	if (isHSL) {
		// Normalize values.
		parsedColor = {
			h: normalizeAngle(
				+h *
					(ANGLE_COEFFICIENT_MAP[angle]
						? ANGLE_COEFFICIENT_MAP[angle]
						: 1),
			),
			s: clamp(+s),
			l: clamp(+l),
			a: clamp(+a / (percentage ? 100 : 1), 1),
		};
		format = HSL_FORMAT;
	} else {
		format = RGB_FORMAT;

		// # is optional.
		if (isHex(str)) {
			str = "#" + str;
		}

		ctx.fillStyle = DEFAULT_COLOR;
		ctx.fillStyle = str;
		// color is rgb or hex string.
		str = ctx.fillStyle;

		if (str[0] === "#") {
			parsedColor = {
				r: int(str.slice(1, 3), 16),
				g: int(str.slice(3, 5), 16),
				b: int(str.slice(5, 7), 16),
				a: 1,
			};
		} else {
			const [r, g, b, a] = (<RegExpExecArray>/\((.+)\)/.exec(str))[1]
				.split(",")
				.map((value) => +value);
			parsedColor = { r, g, b, a };
		}
	}
	// Round the transparency component to two numbers behind
	parsedColor.a = round(parsedColor.a * 100) / 100;
	str = stringify(parsedColor, format);

	return asString ? str : [parsedColor, format, str];
}
