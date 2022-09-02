import { MOUSE_DOWN, MOUSE_MOVE, MOUSE_UP, ROOT, TOUCH_CANCEL, TOUCH_END, TOUCH_MOVE, TOUCH_START } from "../constants";
import { bindEvent } from "../core/events/EventBinder";
import { createElement, getBounds } from "../utils/dom"
import { Marker } from "./Marker";

const PALETTE_CLASSNAME = 'talwin__palette';
const OVERLAY_CLASSNAME = 'tw-overlay';


export const Palette = (parent, talwin) => {

    const el = createElement('', PALETTE_CLASSNAME, parent, { tabindex: '0' });
    const overlay = createElement('', OVERLAY_CLASSNAME, parent);
    const { style } = overlay;
    const marker = Marker(el);

    const { width: WIDTH, height: HEIGHT } = getBounds(el);


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

        bounds = getBounds(el);
        moveAndUpdateColor(e);

        style.display = 'block';
        isDragging = true;
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
        style.display = '';
        isDragging = false;
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

        marker.moveTo(x, y);
    }

    /**
     * Bind events.
     */
    bindEvent(listeners, el, [MOUSE_DOWN, TOUCH_START], dragStart);
    bindEvent(listeners, ROOT, [MOUSE_MOVE, TOUCH_MOVE], dragMove, { passive: false });
    bindEvent(listeners, ROOT, [MOUSE_UP, TOUCH_END, TOUCH_CANCEL], dragEnd);


    return {
        $: el,
        marker,
    }
}