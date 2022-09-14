import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, COLOR, FOCUS_CLASSNAME, FOCUS_IN, FOCUS_OUT, KEY_DOWN, MOUSE_DOWN, MOUSE_MOVE, MOUSE_UP, ROOT, TOUCH_CANCEL, TOUCH_END, TOUCH_MOVE, TOUCH_START } from "../constants";
import { bindEvent } from "../core/events/EventBinder";
import { createElement, getBounds, setVisibility, updateClass } from "../utils/dom"
import { Marker } from "./Marker";

/**
 * Palette component constants.
 */
const PALETTE_CLASSNAME = 'talwin__palette';
const OVERLAY_CLASSNAME = 'tw-overlay';

/**
 * Picker palette.
 *
 * @param {Element} parent - Element to append the palette element to.
 * @param {Object} talwin - Talwin instance.
 * @returns {Object}
 */
export const Palette = (parent, talwin) => {

    const { _clr: colorState, _e: { emit }} = talwin;

    /**
     * Palette element.
     */
    const el = createElement('', PALETTE_CLASSNAME, parent, { tabindex: '0' });

    /**
     * Overlay element, used to set focus only on palette,
     * if marker is moving.
     */
    const overlay = createElement('', OVERLAY_CLASSNAME, parent);
    setVisibility(overlay, false);

    /**
     * Marker component.
     */
    const marker = Marker(el);

    /**
     * Marker Methods.
     */
    let { moveTo, point } = marker;

    /**
     * Palette dimensions
     */
    let WIDTH, HEIGHT;

    /**
     * Move marker one step horizontally using keyboard.
     */
    const moveX = {
        [ARROW_RIGHT]: 1,
        [ARROW_LEFT]: -1
    }

    /**
     * Move marker one step vertically using keyboard.
     */
    const moveY = {
        [ARROW_UP]: -1,
        [ARROW_DOWN]: 1
    }

    /**
     * Palette event listeners.
     */
    let listeners = [];

    /**
     * Palette element bounds.
     */
    let bounds;

    /**
     * State of the palette.
     */
    let isDragging = false;

    /**
     * Marker start moving.
     *
     * @param {Event} e - Mousedown or Touchstart events.
     * @returns {void}
     */
    const dragStart = e => {
        if (e.touches && e.touches.length > 1) {
			return;
		}
        // Save color state.
        colorState.start();
        // Cache palette's bounds.
        bounds = getBounds(el);
        updateDimensions(bounds);
        moveAndUpdateColor(e);
        isDragging = true;
        // Display overlay.
        setVisibility(overlay, isDragging);
        el.focus();
    }

    /**
     * Moves the marker.
     *
     * @param {Event} e - Mousemove or Touchmove event.
     * @returns {void}
     */
    const dragMove = e => {
        if (!isDragging || (e.touches && e.touches.length > 1)) {
			return;
		}
        moveAndUpdateColor(e);
    }


    /**
     * Marker stop moving.
     *
     * @param {Event} e - Mouseup or Touchend or touchcancel events.
     */
    const dragEnd = e => {
        if (isDragging) {
            // Trigger change event if color changes.
            colorState.end(el);
            isDragging = false;
            // Hide overlay.
            setVisibility(overlay, isDragging);
        }
    }


    /**
     * Updates color and moves marker.
     *
     * @param {Number} x - X coordinate.
     * @param {Number} y - Y coordinate.
     */
    const updateColor = (x, y) => {
        moveTo(x, y);
        colorState.update({ s: x / WIDTH, v: 1 - y / HEIGHT });
        emit(COLOR, el);
    }


    /**
     * Moves Marker and Updates color.
     *
     * @param {Event} e - Drag start or drag move events.
     */
    const moveAndUpdateColor = e => {
        let { top, left } = bounds;
        let x, y;
        let touches = e.touches;

        e.preventDefault();

        if (touches) {
            e = touches[0];
        }

        // Calculate the local coordinates,
        // local to the palette.
        x = e.clientX - left;
        y = e.clientY - top;

        // Make sure x and y don't go out of bounds.
		x = x < 0 ? 0 : x > WIDTH ? WIDTH : x;
		y = y < 0 ? 0 : y > HEIGHT ? HEIGHT : y;

        updateColor(x, y);
    }

    /**
     * Updates palette.
     *
     * @param {Object} hsv - HSV color object.
     */
    const update = hsv => {
        updateDimensions();
        moveTo(hsv.s * WIDTH, (1 - hsv.v) * HEIGHT);
    }

    /**
     * Handles palette's focus.
     *
     * @param {Event} e - Focusout or Focusin.
     */
    const handleFocus = e => {
        // Update class condition removes class if its false,
        // add class if true.
        let cond = false;
        // If palette lose focus, remove the focus class,
        // and remove browser keyboard focus.
        if (e.type === FOCUS_OUT) {
            el.blur();
        } else {
            cond = ! isDragging;
        }

        updateClass(el, FOCUS_CLASSNAME, cond);
    }

    /**
     * Handles picking color using keyboard.
     *
     * @param {Event} e - Keydown.
     */
    const handleKeyboard = e => {

        // Add focus class.
        updateClass(el, FOCUS_CLASSNAME, true);

        let key = e.key;

        if (moveX[key] || moveY[key]) {
            e.preventDefault();

            updateDimensions();

            let {x, y} = point();
            let markerX = x, markerY = y;
            // Amount of pixel to move marker horizontally using keyboard.
            let stepX = WIDTH / 100;
            // Amount of pixel to move marker vertically using keyboard.
            let stepY = HEIGHT / 100;

            x += (moveX[key] || 0) * stepX;
            y += (moveY[key] || 0) * stepY;

            // Make sure x and y don't go out of bounds.
            x = x > WIDTH ? WIDTH : x < 0 ? 0 : x;
            y = y > HEIGHT ? HEIGHT : y < 0 ? 0 : y;

            // If the marker changes its position then calculate and set the color.
            if (x !== markerX || y !== markerY) {
                updateColor(x, y);
            }
        }
    }


    /**
     * Updates palette's width and height values.
     *
     * @param {Object} bounds - Palette's Bounding rect.
     */
    const updateDimensions = bounds => {
        ({ width: WIDTH, height: HEIGHT } = bounds || getBounds(el));
    }

    /**
     * Bind events.
     */
    bindEvent(listeners, el, [MOUSE_DOWN, TOUCH_START], dragStart);
    bindEvent(listeners, ROOT, [MOUSE_MOVE, TOUCH_MOVE], dragMove, { passive: false });
    bindEvent(listeners, ROOT, [MOUSE_UP, TOUCH_END, TOUCH_CANCEL], dragEnd);
    bindEvent(listeners, el, [FOCUS_OUT, FOCUS_IN], handleFocus);
    bindEvent(listeners, el, KEY_DOWN, handleKeyboard);

    return {
        $: el,
        marker,
        update,
        e: listeners
    }
}