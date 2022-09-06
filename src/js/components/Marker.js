import { createElement, getBounds } from "../utils/dom";


const MARKER_CLASSNAME = 'talwin__marker';

/**
 * Palette's marker.
 *
 * @param {HTMLElement} parent - Element to append to.
 * @returns {Object}
 */
export const Marker = parent => {

    /**
     * Marker.
     */
    const el = createElement('', MARKER_CLASSNAME, parent);

    
    const { width, height } = getBounds(el);
    /**
     * Cache center X coordinate.
     */
    let centerX = width / 2 - 1;

    /**
     * Cache center Y coordinate.
     */
    let centerY = height / 2 - 1;

    /**
     * Marker X coordinate.
     */
    let markerX = 0;

    /**
     * Marker Y coordinate.
     */
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

    /**
     * Gets marker coordinates.
     *
     * @returns {Object}
     */
    const point = () => ({ x: markerX, y: markerY });


    return {
        $: el,
        moveTo,
        point
    }
}