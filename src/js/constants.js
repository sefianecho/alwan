export const ROOT = document;
export const BODY = ROOT.body;
export const HTML = ROOT.documentElement;

export const PALETTE = 1;
export const HUE_SLIDER = 2;
export const ALPHA_SLIDER = 3;
export const INPUTS = 4;

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

export const TAB = 'Tab';

// Picker supported color formats.
export const COLOR_FORMATS = [HEX_FORMAT, RGB_FORMAT, HSL_FORMAT];


export const { max, min, round } = Math;
export const float = parseFloat;
export const int = parseInt;