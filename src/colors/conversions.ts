import type { HSLA, RGB, RGBA, colorDetails } from "../types";
import { abs, max, min, normalizeAngle, round } from "../utils/math";

const decimalToHex = (decimal: number) =>
	(decimal < 16 ? "0" : "") + decimal.toString(16);

export const RGBToHEX = ({ r, g, b, a }: RGBA) =>
	"#" +
	decimalToHex(r) +
	decimalToHex(g) +
	decimalToHex(b) +
	(a < 1 ? decimalToHex(round(a * 255)) : "");

/**
 * Helper function used for converting HSL to RGB.
 */
const fn = (k: number, s: number, l: number) => {
	k %= 12;
	return round((l - s * min(l, 1 - l) * max(-1, min(k - 3, 9 - k, 1))) * 255);
};

export const HSLToRGB = ({ h, s, l }: colorDetails): RGB => {
	h /= 30;
	s /= 100;
	l /= 100;
	return {
		r: fn(h, s, l),
		g: fn(h + 8, s, l),
		b: fn(h + 4, s, l),
	};
};

export const RGBToHSL = ({ r, g, b, a }: RGBA): HSLA => {
	r /= 255;
	g /= 255;
	b /= 255;

	const cMax = max(r, g, b);
	const cMin = min(r, g, b);
	const d = cMax - cMin;
	const l = (cMax + cMin) / 2;
	const h =
		d === 0
			? 0
			: cMax === r
				? ((g - b) / d) % 6
				: cMax === g
					? (b - r) / d + 2
					: cMax === b
						? (r - g) / d + 4
						: 0;

	return {
		h: normalizeAngle(h * 60),
		s: d ? (d / (1 - abs(2 * l - 1))) * 100 : 0,
		l: l * 100,
		a,
	};
};
