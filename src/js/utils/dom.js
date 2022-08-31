import { ROOT } from "../constants";
import { objectIterator } from "./object";
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

/**
 * Creates a new HTML Element.
 *
 * @param {String}           tagName     - HTML Element's Tag name.
 * @param {String}           className   - HTML Element's class name.
 * @param {Element}          parent - Append the new created element to this element.
 * @param {Object}           data - New element data its attributes, content html or inner text.
 * @param {CallableFunction} callback - Callback.
 * @returns {Element}
 */
export const createElement = (tagName, className, parent, data, callback) => {

    data = data || {}
    const ns = `http://www.w3.org/${tagName === 'svg' ? '2000/svg' : '1999/xhtml'}`;
    const element = document.createElementNS(ns, tagName || 'div');

    if (className) {
        element.className = className;
    }

    objectIterator(data, (key, value) => {
        if (key === 'html') {
            element.innerHTML = value;
        } else if (key === 'text') {
            element.innerText = value;
        } else {
            value && element.setAttributeNS('', key, value);
        }
    });

    callback && callback(element);

    return parent ? parent.appendChild(element) : element;
}


/**
 * Gets element bounds.
 *
 * @param {HTMLElement} el Element.
 * @returns {Object}
 */
export const getBounds = (el) => el && el.getBoundingClientRect();


/**
 * Gets an element's parent.
 *
 * @param {Element} el - Any html element.
 * @returns {Element}
 */
export const getParent = el => el.parentElement;


/**
 * Replace a child node with another node.
 *
 * @param {Node} newChild - Any html node.
 * @param {Node} oldChild - Any html node.
 * @returns {Node}
 */
export const replaceElement = (newChild, oldChild) => getParent(oldChild).replaceChild(newChild, oldChild) && newChild;

/**
 * Removes an element from the DOM.
 *
 * @param {HTMLElement} element - Any html node.
 * @param {Boolean} destroy - Remove Reference. 
 * @returns {Element|null}
 */
export const removeElement = (element, destroy) => element && getParent(element).removeChild(element) && (destroy ? null : element);