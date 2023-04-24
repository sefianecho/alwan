import { MARKER_CLASSNAME, OVERLAY_CLASSNAME, PALETTE_CLASSNAME } from "../constants/classnames";
import { CHANGE, COLOR, KEY_DOWN, POINTER_DOWN, POINTER_MOVE, POINTER_UP, ROOT } from "../constants/globals";
import { createElement, getBounds, translate, removeElement } from "../utils/dom"
import { confineNumber, min } from "../utils/number";

/**
 * Picker palette.
 *
 * @param {Element} root - Root element to append the palette elements to.
 * @param {Object} alwan - Alwan instance.
 * @returns {Object}
 */
export const Palette = (root, alwan, events) => {
    /**
     * Marker X coordinate.
     *
     * @type {number}
     */
    let markerX;

    /**
     * Marker Y coordinate.
     *
     * @type {number}
     */
    let markerY;

    /**
     * Palette element bounds.
     *
     * @type {DOMRect}
     */
    let paletteBounds;

    /**
     * A transparent element cover the whole document.
     *
     * @type {Element}
     */
    let overlayElement;

    /**
     * Indicates whether a pointer (mouse, pen or touch) is down.
     */
    let isPointerDown = false;

    /**
     * Palette element.
     */
    const palette = createElement('', PALETTE_CLASSNAME, root, { tabindex: '0' });

    /**
     * Palette marker.
     */
    const marker = createElement('', MARKER_CLASSNAME, palette);

    /**
     * Move marker horizontally using the keyboard arrow keys.
     */
    const keyboardX = {
        ArrowRight: 1,
        ArrowLeft: -1
    };

    /**
     * Move marker vertically using the keyboard arrow keys
     */
    const keyboardY = {
        ArrowDown: 1,
        ArrowUp: -1
    };

    /**
     * Moves marker and updaets the color state.
     * Moves it using a pointer (mouse, touch or pen) or keyboard arrow keys.
     *
     * @param {Event} param0 - Pointer Event.
     * @param {object} keyboard - Keyboard steps.
     * @param {Function} change - Callback function, called when color changes.
     */
    const moveMarkerAndUpdateColor = ({ clientX, clientY }, keyboard, change) => {

        let { x, y, width, height } = paletteBounds;
        let v, L;

        if (keyboard) {
            x = markerX + keyboard.x * width / 100;
            y = markerY + keyboard.y * height / 100;
        } else {
            x = clientX - x;
            y = clientY - y;
        }

        x = confineNumber(x, width);
        y = confineNumber(y, height);

        if (x !== markerX || y !== markerY) {
            markerX = x;
            markerY = y;
            translate(marker, markerX, markerY);

            v = (1 - y / height);
            L = v * (1 - x / (2 * width));

            alwan._color._update({
                S: L === 1 || L === 0 ? 0 : (v - L) / min(L, 1 - L),
                L
            });

            alwan._events._dispatch(COLOR, palette);

            if (change) {
                change();
            }
        }
    }

    /**
     * Starts dragging the marker.
     *
     * @param {PointerEvent} e - Event.
     */
    const dragStart = e => {
        if (! overlayElement) {
            overlayElement = createElement('', OVERLAY_CLASSNAME, root);
        }
        // Save color state.
        alwan._color._saveState();
        paletteBounds = getBounds(palette);
        isPointerDown = true;
        moveMarkerAndUpdateColor(e);
        palette.focus();
    }

    /**
     * Dragging the marker.
     *
     * @param {PointerEvent} e - Event.
     */
    const drag = e => {
        if (isPointerDown) {
            moveMarkerAndUpdateColor(e);
        }
    }

    /**
     * Drag end (released the marker).
     *
     * @param {PointerEvent} e - Event.
     */
    const dragEnd = e => {
        if (isPointerDown) {
            alwan._color._triggerChange(palette);
            overlayElement = removeElement(overlayElement);
            isPointerDown = false;
        }
    }

    /**
     * Moves marker using keyboard arrow keys and adds focus-visible to the palette.
     *
     * @param {KeyboardEvent} e - Event.
     */
    const handleKeyboard = e => {
        let key = e.key;

        if (keyboardX[key] || keyboardY[key]) {
            e.preventDefault();

            paletteBounds = getBounds(palette);

            moveMarkerAndUpdateColor({}, { x: keyboardX[key] || 0, y: keyboardY[key] || 0 },
                () => {
                    alwan._events._dispatch(CHANGE, palette);
                }
            );
        }
    }

    /**
     * Bind events.
     */
    events._bind(palette, POINTER_DOWN, dragStart);
    events._bind(ROOT, POINTER_MOVE, drag);
    events._bind(ROOT, POINTER_UP, dragEnd);
    events._bind(palette, KEY_DOWN, handleKeyboard);


    return {
        _element: palette,

        /**
         * Initialize component.
         *
         * @param {object} options - Alwan options.
         * @param {object} instance - Alwan instance.
         */
        _init(_options, instance) {
            alwan = instance || alwan;
        },

        /**
         * Updates marker position from an hsv color object.
         *
         * @param {object} param0 - HSL color object.
         */
        _update({ S, L }) {
            paletteBounds = getBounds(palette);
            // Temporary hold the value of V in the HSV color space.
            markerY = L + S * min(L, 1 - L);

            markerX = (markerY ? 2 * (1 - L / markerY) : 0) * paletteBounds.width;
            markerY = (1 - markerY) * paletteBounds.height;

            translate(marker, markerX, markerY);
        }
    }
}