import type { colorFormat } from "../types";
import { PI } from "../utils/math";

export const ROOT = document;
export const DOC_ELEMENT = ROOT.documentElement;

export const DEFAULT_COLOR = "#000";

export const BUTTON = "button";

export const OPEN = "open";
export const CLOSE = "close";
export const COLOR = "color";
export const CLICK = "click";
export const POINTER_DOWN = "pointerdown";
export const POINTER_MOVE = "pointermove";
export const POINTER_UP = "pointerup";
export const SCROLL = "scroll";
export const RESIZE = "resize";
export const KEY_DOWN = "keydown";
export const INPUT = "input";
export const CHANGE = "change";
export const BLUR = "blur";
export const FOCUS_IN = "focusin";
export const MOUSE_OUT = "mouseout";
export const WHEEL = "wheel";

export const HEX_FORMAT: colorFormat = "hex";
export const RGB_FORMAT: colorFormat = "rgb";
export const HSL_FORMAT: colorFormat = "hsl";

export const TAB = "Tab";
export const ESCAPE = "Escape";
export const ENTER = "Enter";

export const COLOR_FORMATS: colorFormat[] = [
	HEX_FORMAT,
	RGB_FORMAT,
	HSL_FORMAT,
];

export const ARIA_LABEL = "aria-label";

// Arrow keys move steps.
export const ARROW_KEYS: Record<string, [x: number, y: number]> = {
	ArrowUp: [0, -1],
	ArrowDown: [0, 1],
	ArrowRight: [1, 0],
	ArrowLeft: [-1, 0],
};

export const ANGLE_COEFFICIENT_MAP: { [angle: string]: number } = {
	deg: 1,
	turn: 360,
	rad: 180 / PI,
	grad: 0.9,
};

export const HSL_REGEX =
	/^hsla?\(\s*([+-]?\d*\.?\d+)(\w*)?\s*[\s,]\s*([+-]?\d*\.?\d+)%?\s*,?\s*([+-]?\d*\.?\d+)%?(?:\s*[\/,]\s*([+-]?\d*\.?\d+)(%)?)?\s*\)?$/;
