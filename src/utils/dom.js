import { BUTTON_CLASSNAME, CONTAINER_CLASSNAME, SLIDER_CLASSNAME } from "../constants/classnames";
import { BUTTON, DOC_ELEMENT, INPUT, INSERT_AFTER_LAST_CHILD, ROOT } from "../constants/globals";
import { merge, objectIterator } from "./object";
import { isString } from "./string";
import { isset } from "./util";

/**
 * Gets the body element.
 *
 * @returns Document's body.
 */
export const bodyElement = () => ROOT.body;

/**
 * Gets elements.
 *
 * @param {string|Element} reference - CSS selector or a HTML element.
 * @param {Document|Element} context - Element to search from.
 * @param {boolean} all - Select all elements.
 * @returns {null|Element|NodeList}
 */
export const getElement = (reference, context = bodyElement(), all = false) => {
    if (isString(reference) && reference.trim()) {
        return context[`querySelector${ all ? 'All' : ''}`](reference);
    }
    // Reference must be an element in the page.
    if (reference instanceof Element && bodyElement().contains(reference) && reference !== bodyElement()) {
        return reference;
    }

    return null;
}

/**
 * Inserts an element relative to another element (target element).
 *
 * @param {Element} element - The element to be inserted.
 * @param {Element} targetElement - Element used as a reference.
 * @param {InsertPosition} where - Insert position relative to the targetElement.
 * @returns {Element|undefined} - The inserted element.
 */
export const insertElement = (element, targetElement, where = INSERT_AFTER_LAST_CHILD) => {
    if (element && targetElement) {
        targetElement.insertAdjacentElement(where, element);
    }
}

/**
 * Sets element's inner html.
 *
 * @param {Element} element - An HTML element.
 * @param {string} html - HTML string.
 */
export const setHTML = (element, html) => {
    element.innerHTML = html;
}

/**
 * Creates a new HTML Element.
 *
 * @param {string} tagName - Element tag name.
 * @param {string} className - Element class name.
 * @param {Element} targetElement - Insert the new element relative to this element using position.
 * @param {object} details - Element details (attributes + Initial content).
 * @param {InsertPosition} insertPosition - Insert position.
 * @returns {Element} The new created element.
 */
export const createElement = (tagName, className, targetElement, details, insertPosition) => {
    const element = ROOT.createElement(tagName || 'div');

    if (className) {
        element.className = className;
    }

    objectIterator(details || {}, (value, name) => {
        if (name === 'html') {
            setHTML(element, value);
        } else if (value) {
            element.setAttribute(name, value);
        }
    });

    if (targetElement) {
        insertElement(element, targetElement, insertPosition);
    }

    return element;
}

/**
 * Gets element's bounding rect.
 *
 * @param {Document|Element} element - Element.
 * @returns {DOMRect}
 */
export const getBounds = (element) => {
    let x, y, width, height, right, bottom;

    if (element === ROOT) {
        x = y = 0;
        width = right = DOC_ELEMENT.clientWidth;
        height = bottom = DOC_ELEMENT.clientHeight;
    } else {
        ({ x, y, width, height, right, bottom } = element.getBoundingClientRect());
    }

    return [x, y, width, height, right, bottom];
}

/**
 * Replaces an element in the DOM with another element.
 *
 * @param {Element} element - Element to replace another element.
 * @param {Element} replacement - Element to be replaced by the newElement.
 * @returns {Element} The new element.
 */
export const replaceElement = (element, replacement) => {
    element.replaceWith(replacement);
    return replacement;
}

/**
 * Remove element from the document.
 *
 * @param {Element} element - Element to remove.
 */
export const removeElement = (element) => {
    if (element) {
        element.remove();
    }

    return null;
}

/**
 * Gets overflow ancestor of an element (body element is not included).
 *
 * @param {Element} element - Element.
 * @param {array<Element|Document>} ancestors - Array of overflow ancestors.
 * @returns {array<Element|Document>}
 */
export const getOverflowAncestors = (element, ancestors = [ROOT]) => {

    if (element) {
        element = element.parentElement;
    }

    if (! element || element === bodyElement()) {
        return ancestors;
    }

    if (/auto|scroll|overflow|clip|hidden/.test(getComputedStyle(element).overflow)) {
        ancestors.push(element);
    }

    return getOverflowAncestors(element, ancestors);
}

/**
 * Sets a CSS custom property if value is not undefined, otherwise returns the value of,
 * the given property.
 *
 * @param {HTMLElement} element  - Element to set/get its custom property.
 * @param {string} property - Custom property name.
 * @param {string | undefined} value    - Custom property value.
 */
export const customProperty = (element, property, value) => {

    if (element) {
        return element.style[isset(value) ? 'setProperty' : 'getPropertyValue']('--alwan-' + property, value);
    }

    return '';
}


/**
 * Adds/Removes a class to/from an based on a boolean variable.
 *
 * @param {Element} element - Element.
 * @param {string|string[]} tokens - Class name or array of classes.
 * @param {boolean} toggler - Whether to add (true) or remove a class.
 */
export const toggleClassName = (element, tokens, toggler) => {

    if (isString(tokens)) {
        tokens = [tokens];
    }

    tokens.forEach(token => {
        if (token) {
            element.classList.toggle(token, toggler);
        }
    });
}

/**
 * Creates a button Element.
 *
 * @param {string} className - Class.
 * @param {Element} targetElement - TargetElement.
 * @param {object} details - Button details.
 * @param {string} insertPosition - Button insert position.
 * @returns {Element} A button.
 */
export const createButton = (className, targetElement, details, insertPosition) => {
    return createElement(BUTTON, BUTTON_CLASSNAME + ' ' + className, targetElement, merge({ type: BUTTON }, details), insertPosition);
}

/**
 * Translates an element.
 *
 * @param {Element} element - Element to translate.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 */
export const translate = (element, x, y) => {
    element.style.transform = `translate(${x}px,${y}px)`;
}

/**
 * Creates a slider.
 *
 * @param {string} className - CSS class.
 * @param {Element} parent - Slider parent.
 * @param {number} max - Max property.
 * @param {number} step - Step property.
 * @returns {HTMLInputElement} - Slider.
 */
export const createSlider = (className, parent, max, step) => {
    return createElement(INPUT, SLIDER_CLASSNAME + ' ' + className, parent, { type: 'range', max, step });
}

/**
 * Creates a container element.
 *
 * @param {Element} targetElement - Element used as a reference.
 * @param {InsertPosition | undefined} where - Insert position relative to the targetElement
 */
export const createContainer = (targetElement, where) => {
    return createElement('', CONTAINER_CLASSNAME, targetElement, {}, where);
}