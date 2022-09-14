import { merge } from "../utils/object";

/**
 * SVG attributes that are static for all SVGs.
 */
const staticAttrs = {
    'aria-role': 'none',
    focusable: 'false'
}

const clipboardSVG = '<path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path>';
const checkSVG = '<path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"></path>';
const switchSVG = '<path d="M10 1L5 8h10l-5-7zm0 18l5-7H5l5 7z"></path>';

/**
 * Gets SVG attributes object.
 *
 * @param {String} width - SVG Width.
 * @param {String} height - SVG Height.
 * @param {String} viewBox - SVG ViewBox.
 * @param {String} content - SVG Content.
 * @returns {Object}
 */
const svgAttrs = (width, height, viewBox, content) => ({ width, height, viewBox, content });


export const clipboardSVGAttrs = merge(svgAttrs('18', '18', '0 0 24 24', clipboardSVG), staticAttrs);
export const checkSVGAttrs = merge(svgAttrs('18', '18', '0 0 24 24', checkSVG), staticAttrs);
export const switchSVGAttrs = merge(svgAttrs('15', '15', '0 0 20 20', switchSVG), staticAttrs);