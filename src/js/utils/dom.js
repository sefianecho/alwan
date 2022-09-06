import { BODY, ROOT, SCROLL } from "../constants";
import { objectIterator } from "./object";
import { isString } from "./util";

/**
 * Gets a DOM element.
 *
 * @param {String|Element} ref - CSS selector or DOM element.
 * @param {Element} context - Element to search from.
 * @param {Boolean} all - Get all elements.
 * @returns {Element|null}
 */
export const getElement = (ref, context, all) =>
    isString(ref) ? ref && (context || ROOT)['querySelector' + (all ? 'All' : '')](ref)
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

    if (parent) {
        parent.appendChild(element);
    }

    callback && callback(element);

    return element;
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


/**
 * Gets any scrollable ancestor of an element.
 * Document is always included.
 *
 * @param {HTMLElement} el - Subject element.
 * @returns {Array}
 */
export const getScrollableAncestors = el => {
    el = getParent(el);
  
    let scrollableElements = [ROOT];
  
    while (el !== BODY) {
      let overflow = getComputedStyle(el).overflow;
      if (overflow === 'auto' || overflow === SCROLL) {
        scrollableElements.push(el);
      }
      el = getParent(el);
    }
  
    return scrollableElements;
}


/**
 * Check if an element is visible in the viewport of all scrollable elements.
 *
 * @param {HTMLElement} el - Any html element.
 * @param {Array} scrollableElements - scrollable elements.
 * @returns {boolean}
 */
export const isInViewport = (el, scrollableElements) =>
    scrollableElements.every(scrollable => {
        let isVisible = true;

        if (scrollable !== ROOT) {
            let {top: elTop, bottom: elBottom} = getBounds(el);
            let {top: scrollableTop, bottom: scrollableBottom} = getBounds(scrollable);

            isVisible = elTop >= scrollableTop && scrollableBottom >= elBottom;
        }

        return isVisible;
    });


/**
 * Sets a CSS custom property.
 *
 * @param {HTMLElement} el  - Element to set its custom property.
 * @param {string} property - Property name.
 * @param {string} value    - Property value.
 */
export const setCustomProperty = (el, property, value) => {
    el && el.style.setProperty('--' + property, value);
}

/**
 * Gets the last focusable element in an element (context).
 *
 * @param {Element} context - Element which the last focusable elment is an ancestor.
 * @returns {Element}
 */
export const getLastFocusableElement = context => {
    let focusableElements = getElement('button,input', context, true);
    return focusableElements[focusableElements.length - 1];
}

/**
 * Hides/Shows element.
 * Truthy value or non empty array shows the element,
 * else hides it.
 * 
 * @param {Element} el - Element to show/hide.
 * @param {Array|Boolean} cond - Condition.
 */
export const setVisibility = (el, cond) => {
    let length = cond.length;

    if (length != null) {
        cond = length;
    }

    el.style.display = cond ? '' : 'none';
}