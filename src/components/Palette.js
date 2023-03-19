import { MARKER_CLASSNAME, OVERLAY_CLASSNAME, PALETTE_CLASSNAME } from "../constants/classnames";
import { CHANGE, COLOR, KEY_DOWN, POINTER_DOWN, POINTER_MOVE, POINTER_UP, ROOT } from "../constants/globals";
import { createElement, getBounds, translate, removeElement } from "../utils/dom"
import { confineNumber } from "../utils/number";

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
     * Palette element dimension.
     */
    const { width, height } = getBounds(palette);

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
     * Move marker and update color state.
     *
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {Function} change - Callback function if color changed.
     */
    const moveMarkerAndUpdateColor = (x, y, change) => {

        x = confineNumber(x, width);
        y = confineNumber(y, height);

        if (x !== markerX || y !== markerY) {
            markerX = x;
            markerY = y;
            translate(marker, markerX, markerY);
            alwan._color._update({ s: markerX / width, v: (1 - markerY / height)});
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
        moveMarkerAndUpdateColor(e.clientX - paletteBounds.x, e.clientY - paletteBounds.y);
        palette.focus();
    }

    /**
     * Dragging the marker.
     *
     * @param {PointerEvent} e - Event.
     */
    const drag = e => {
        if (isPointerDown) {
            moveMarkerAndUpdateColor(e.clientX - paletteBounds.x, e.clientY - paletteBounds.y);
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

            moveMarkerAndUpdateColor(
                markerX + (keyboardX[key] || 0) * width / 100,
                markerY + (keyboardY[key] || 0) * height / 100,
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
         * @param {object} param0 - HSV color object.
         */
        _update({ s, v }) {
            translate(marker, s * width, (1 - v) * height);
        }
    }
}