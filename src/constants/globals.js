export const ROOT = document;
export const DOC_ELEMENT = ROOT.documentElement;

export const BUTTON = 'button';

export const OPEN = 'open';
export const CLOSE = 'close';
export const COLOR = 'color';
export const CLICK = 'click';
export const POINTER_DOWN = 'pointerdown';
export const POINTER_MOVE = 'pointermove';
export const POINTER_UP = 'pointerup';
export const SCROLL = 'scroll';
export const RESIZE = 'resize';
export const KEY_DOWN = 'keydown';
export const INPUT = 'input';
export const CHANGE = 'change';
export const BLUR = 'blur';
export const FOCUS_IN = 'focusin';
export const MOUSE_OUT = 'mouseout';

export const HEX_FORMAT = 'hex';
export const RGB_FORMAT = 'rgb';
export const HSL_FORMAT = 'hsl';

export const TAB = 'Tab';
export const ESCAPE = 'Escape';

// Picker supported color formats.
export const COLOR_FORMATS = [HEX_FORMAT, RGB_FORMAT, HSL_FORMAT];

// Element insert positions.
export const INSERT_BEFORE_FIRST_CHILD = 'afterbegin';
export const INSERT_AFTER = 'afterend';
export const INSERT_AFTER_LAST_CHILD = 'beforeend';

/**
 * Horizontal movement using the keyboard arrow keys.
 */
export const KEYBOARD_X = {
    ArrowRight: 1,
    ArrowLeft: -1
};

/**
 * Vertical movement using the keyboard arrow keys.
 */
export const KEYBOARD_Y = {
    ArrowDown: 1,
    ArrowUp: -1
};