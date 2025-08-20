import type { colorFormat } from "./types";

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
export const MOUSE_LEAVE = "mouseleave";
export const HEX_FORMAT: colorFormat = "hex";
export const RGB_FORMAT: colorFormat = "rgb";
export const HSL_FORMAT: colorFormat = "hsl";

export const TAB = "Tab";
export const ESCAPE = "Escape";
export const ENTER = "Enter";

export const CAPTURE_PHASE = { capture: true };

export const COLOR_FORMATS: colorFormat[] = [
    HEX_FORMAT,
    RGB_FORMAT,
    HSL_FORMAT,
];
