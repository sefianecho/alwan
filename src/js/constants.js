export const ROOT = document;
export const BODY = ROOT.body;
export const HTML = ROOT.documentElement;

export const EXCLUDE_PALETTE_HUE = 1;
export const ONLY_INPUTS = 2;
export const EXCLUDE_INPUTS = 3;

export const CLICK = 'click';
export const MOUSE_DOWN = 'mousedown';
export const MOUSE_MOVE = 'mousemove';
export const MOUSE_UP = 'mouseup';
export const TOUCH_START = 'touchstart';
export const TOUCH_MOVE = 'touchmove';
export const TOUCH_END = 'touchend';
export const TOUCH_CANCEL = 'touchcancel';
export const SCROLL = 'scroll';
export const RESIZE = 'resize';
export const KEY_DOWN = 'keydown';
export const INPUT = 'input';

export const HEX_FORMAT = 'hex';
export const RGB_FORMAT = 'rgb';
export const HSL_FORMAT = 'hsl';
export const HSV_FORMAT = 'hsv';

export const TAB = 'Tab';
export const ARROW_RIGHT = 'ArrowRight';
export const ARROW_LEFT = 'ArrowLeft';
export const ARROW_UP = 'ArrowUp';
export const ARROW_DOWN = 'ArrowDown';
export const ENTER = 'Enter';

// Picker supported color formats.
export const COLOR_FORMATS = [HEX_FORMAT, RGB_FORMAT, HSL_FORMAT];


export const { max, min, round } = Math;
export const float = parseFloat;
export const int = parseInt;