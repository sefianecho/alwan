import { ROOT } from "../constants";
import { isString } from "./util";

/**
 * Gets an HTML element
 *
 * @param {String|Element} ref - CSS selector or DOM element.
 * @returns {Element|null}
 */
export const getElement = (ref, context) =>
isString(ref) ? ref && (context || ROOT).querySelector(ref)
    : ref instanceof Element ? ref
    : null;