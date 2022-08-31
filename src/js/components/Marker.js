import { createElement, getBounds } from "../utils/dom";


const MARKER_CLASSNAME = 'talwin__marker';

/**
 * Palette's marker.
 *
 * @param {HTMLElement} parent - Element to append to.
 * @returns {Object}
 */
export const Marker = parent => {

    const el = createElement('', MARKER_CLASSNAME, parent);
    const { width, height } = getBounds(el);
    let centerX = width / 2 - 1;
    let centerY = height / 2 - 1;

    let markerX = 0;
    let markerY = 0;

    /**
     * Moves marker to the x, y coordinates.
     *
     * @param {Number} x - X coordinate.
     * @param {Number} y - Y coordinate.
     */
    const moveTo = (x, y) => {
        markerX = x;
        markerY = y;
        el.style.transform = `translate(${x - centerX}px, ${y - centerY}px)`;
    }

    const getPosition = () => ({ x: markerX, y: markerY });

    return {
        moveTo,
        getPosition
    }
}