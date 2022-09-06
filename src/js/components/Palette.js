import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, BLUR, FOCUS_CLASSNAME, FOCUS_IN, MOUSE_DOWN, MOUSE_MOVE, MOUSE_UP, ROOT, TOUCH_CANCEL, TOUCH_END, TOUCH_MOVE, TOUCH_START } from "../constants";
import { bindEvent } from "../core/events/EventBinder";
import { createElement, getBounds } from "../utils/dom"
import { Marker } from "./Marker";

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

    const el = createElement('', PALETTE_CLASSNAME, parent, { tabindex: '0' });
    const overlay = createElement('', OVERLAY_CLASSNAME, parent);
    const { style } = overlay;
    const marker = Marker(el);

    const { width: WIDTH, height: HEIGHT } = getBounds(el);

    const stepX = WIDTH / 100;
    const stepY = HEIGHT / 100;

    const moveX = {
        [ARROW_RIGHT]: stepX,
        [ARROW_LEFT]: -stepX
    }

    const moveY = {
        [ARROW_UP]: -stepY,
        [ARROW_DOWN]: stepY
    }

    let listeners = [];
    let bounds;

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
        colorState.start();
        bounds = getBounds(el);
        moveAndUpdateColor(e);
        style.display = 'block';
        isDragging = true;
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
            colorState.end(el);
            style.display = '';
            isDragging = false;
        }
    }


    /**
     * Updates color and moves marker.
     *
     * @param {Number} x - X coordinate.
     * @param {Number} y - Y coordinate.
     */
    const updateColor = (x, y) => {
        marker.moveTo(x, y);
        colorState.update({ s: x / WIDTH, v: 1 - y / HEIGHT });
        emit('color', colorState.value, el);
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
        marker.moveTo(hsv.s * WIDTH, (1 - hsv.v) * HEIGHT);
    }

    /**
     * Moves marker (picker) using keyboard's arrow keys.
     *
     * @param {Event} e - Keydown.
     * @param {String} key - Key.
     */
    const keyboard = (e, key) => {

        // This adds a focus class if any key is pressed.
        handleFocus(e);

        if (moveX[key] || moveY[key]) {

            e.preventDefault();
            let {x, y} = marker.getPosition();
            let markerX = x, markerY = y;

            x += moveX[key] || 0;
            y += moveY[key] || 0;

            // Make sure x and y don't go out of bounds.
            x = x > WIDTH ? WIDTH : x < 0 ? 0 : x;
            y = y > HEIGHT ? HEIGHT : y < 0 ? 0 : y;

            // If the marker changes its position then calculate and set the color.
            if (x !== markerX || y !== markerY) {
                updateColor();
            }
        }
    }

    /**
     * Handles palette's focus.
     *
     * @param {Event} e - Blur or Focusin.
     */
    const handleFocus = e => {
        let method;

        // If palette lose focus, remove the focus class,
        // and remove browser keyboard focus.
        if (e.type === BLUR) {
            method = 'remove';
            el.blur();
        } else {
            // If focus is coming from keyboard then add focus class.
            if (! isDragging) {
                method = 'add';
            }
        }

        method && el.classList[method](FOCUS_CLASSNAME);
    }

    /**
     * Bind events.
     */
    bindEvent(listeners, el, [MOUSE_DOWN, TOUCH_START], dragStart);
    bindEvent(listeners, ROOT, [MOUSE_MOVE, TOUCH_MOVE], dragMove, { passive: false });
    bindEvent(listeners, ROOT, [MOUSE_UP, TOUCH_END, TOUCH_CANCEL], dragEnd);
    bindEvent(listeners, el, [BLUR, FOCUS_IN], handleFocus);

    return {
        $: el,
        update,
        keyboard,
        marker,
    }
}