import { FOCUS_CLASSNAME, MARKER_CLASSNAME, OVERLAY_CLASSNAME, PALETTE_CLASSNAME } from "../classnames";
import { FOCUS_IN, FOCUS_OUT, KEY_DOWN, POINTER_DOWN, POINTER_MOVE, POINTER_UP, ROOT } from "../constants";
import { createElement, getBounds, toggleClassName, translate, removeElement } from "../utils/dom"
import { numberRange } from "../utils/number";

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
     * Moves marker and updates color.
     *
     * @param {PointerEvent} param0 - Event.
     */
    const moveMarkerAndUpdateColor = ({ clientX, clientY }) => {
        clientX = numberRange(clientX - paletteBounds.x, width);
        clientY = numberRange(clientY - paletteBounds.y, height);

        if (clientX !== markerX || clientY !== markerY) {
            markerX = clientX;
            markerY = clientY;
            translate(marker, markerX, markerY);
            // Update color.
            // TODO dispatch color event.
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
            overlayElement = removeElement(overlayElement);
            isPointerDown = false;
        }
    }

    /**
     * Handles palette's focus.
     *
     * @param {FocusEvent} param0 - Event.
     */
    const handleFocus = ({ type }) => {
        // If the palette receive focus by a non pointer event,
        // (not a touch/pen/mouse) then add focus class to simulate focus-visible,
        // if the palette loses focus then remove the focus class.
        // because .blur() returns undefined wich is a faulty value,
        // that means remove class.
        toggleClassName(palette, FOCUS_CLASSNAME, type === FOCUS_IN ? ! isPointerDown : palette.blur());
    }

    /**
     * Moves marker using keyboard arrow keys and adds focus-visible to the palette.
     *
     * @param {KeyboardEvent} e - Event.
     */
    const handleKeyboard = e => {
        // Add focus classname to the palette.
        toggleClassName(palette, FOCUS_CLASSNAME);
        let key = e.key;
        let currentX = markerX;
        let currentY = markerY;

        if (keyboardX[key] || keyboardY[key]) {
            e.preventDefault();
            paletteBounds = getBounds(palette);

            markerX = numberRange(markerX + (keyboardX[key] || 0) * width / 100, width, 0);
            markerY = numberRange(markerY + (keyboardY[key] || 0) * height / 100, height, 0);

            if (markerX !== currentX || markerY !== currentY) {
                translate(marker, markerX, markerY);
                // TODO:
                // Update color.
                // dispatch change event.
                // dispatch color event.
            }
        }
    }

    /**
     * Bind events.
     */
    events._bind(palette, POINTER_DOWN, dragStart);
    events._bind(ROOT, POINTER_MOVE, drag);
    events._bind(ROOT, POINTER_UP, dragEnd);
    events._bind(palette, [FOCUS_IN, FOCUS_OUT], handleFocus);
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
            alwan = instance;
        },

        /**
         * Updates marker position from an hsv color object.
         *
         * @param {object} param0 - HSV color object.
         */
        _updateMarker({ s, v }) {
            translate(marker, s * width, (1 - v) * height);
        }
    }
}