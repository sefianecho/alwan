import { MARKER_CLASSNAME, OVERLAY_CLASSNAME, PALETTE_CLASSNAME } from "../constants/classnames";
import { CHANGE, COLOR, DOC_ELEMENT, KEYBOARD_X, KEYBOARD_Y, KEY_DOWN, POINTER_DOWN, POINTER_MOVE, POINTER_UP, ROOT } from "../constants/globals";
import { addEvent, removeEvent } from "../core/events/binder";
import { createElement, getBounds, translate, removeElement, bodyElement } from "../utils/dom"
import { boundNumber, min } from "../utils/number";

/**
 * Color picking area, pick color by dragging the marker.
 *
 * @param {HTMLElement} ref - Insert palette element relative to this element.
 * @param {Object} alwan - Alwan instance.
 * @returns {Object}
 */
export const Palette = (ref, alwan) => {
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
     * A transparent element that covers the whole document.
     *
     * @type {HTMLDivElement | null}
     */
    let backdropElement;

    /**
     * Indicates whether a pointer (mouse, pen or touch) is down.
     */
    let isPointerDown = false;

    /**
     * Palette element.
     */
    const palette = createElement('', PALETTE_CLASSNAME, ref, { tabindex: '0' });

    /**
     * Palette's marker.
     */
    const marker = createElement('', MARKER_CLASSNAME, palette);

    /**
     * Moves marker and updates the color state.
     * Moves it using a pointer (mouse, touch or pen) or keyboard arrow keys.
     *
     * @param {PointerEvent | null} e - Pointer Event.
     * @param {object} keyboard - Keyboard steps.
     * @param {Function} change - Callback function, called when color changes.
     */
    const moveMarkerAndUpdateColor = (e, keyboard, change) => {
        let [ x, y, width, height ] = paletteBounds;
        let v, L;

        if (e) {
            x = e.clientX - x;
            y = e.clientY - y;
        } else {
            x = markerX + keyboard.x * width / 100;
            y = markerY + keyboard.y * height / 100;
        }

        x = boundNumber(x, width);
        y = boundNumber(y, height);

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
        if (! backdropElement) {
            backdropElement = createElement('', OVERLAY_CLASSNAME, DOC_ELEMENT);
        }
        // Save color state.
        alwan._color._saveState();
        paletteBounds = getBounds(palette);
        isPointerDown = true;
        moveMarkerAndUpdateColor(e);
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
            backdropElement = removeElement(backdropElement);
            isPointerDown = false;
        }
    }

    /**
     * Moves marker using keyboard arrow keys and adds focus-visible to the palette.
     *
     * @param {KeyboardEvent} e - Event.
     */
    const handleKeyboard = e => {
        const key = e.key;
        const x = KEYBOARD_X[key] || 0;
        const y = KEYBOARD_Y[key] || 0;

        if (x || y) {
            e.preventDefault();

            paletteBounds = getBounds(palette);

            moveMarkerAndUpdateColor(null, { x, y },
                () => {
                    alwan._events._dispatch(CHANGE, palette);
                }
            );
        }
    }

    /**
     * Bind events.
     */
    addEvent(palette, POINTER_DOWN, dragStart);
    addEvent(ROOT, POINTER_MOVE, drag);
    addEvent(ROOT, POINTER_UP, dragEnd);
    addEvent(palette, KEY_DOWN, handleKeyboard);


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

            markerX = (markerY ? 2 * (1 - L / markerY) : 0) * paletteBounds[2];
            markerY = (1 - markerY) * paletteBounds[3];

            translate(marker, markerX, markerY);
        },

        /**
         * Remove listeners attached to the document.
         */
        _destroy() {
            removeEvent(ROOT, POINTER_MOVE, drag);
            removeEvent(ROOT, POINTER_UP, dragEnd);
        }
    }
}