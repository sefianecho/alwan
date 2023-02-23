import { BUTTON, HTML, ROOT } from "../constants";
import { merge, objectIterator } from "./object";
import { isString, trimString } from "./string";

/**
 * Gets the body element.
 *
 * @returns Document's body.
 */
export const body = () => ROOT.body;

/**
 * Gets elements.
 *
 * @param {string|Element} reference - CSS selector or a HTML element.
 * @param {Document|Element} context - Element to search from.
 * @param {boolean} all - Select all elements.
 * @returns {null|Element|NodeList}
 */
export const getElement = (reference, context = ROOT, all = false) => {
    if (isString(reference) && trimString(reference)) {
        return context[`querySelector${ all ? 'All' : ''}`](reference);
    }

    if (reference instanceof Element) {
        return reference;
    }

    return null;
}

/**
 * Inserts an element relative to another element (target element).
 *
 * @param {Element} element - The element to be inserted.
 * @param {Element} targetElement - Element used as a reference.
 * @param {string} where - Insert position relative to the targetElement.
 * @returns {Element|undefined} - The inserted element.
 */
export const insertElement = (element, targetElement, where) => {
    if (element && targetElement) {
        return targetElement.insertAdjacentElement(where || 'beforeend', element);
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
export const createElement = (tagName, className, targetElement, details = {}, insertPosition) => {
    const element = ROOT.createElement(tagName || 'div');
    element.className = className;

    objectIterator(details, (value, name) => {
        if (name === '_content') {
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
    if (element === ROOT) {
        return {
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: HTML.clientWidth,
            bottom: HTML.clientHeight
        }
    }
    return element.getBoundingClientRect();
}

/**
 * Gets an element parent.
 *
 * @param {Element} element - Element.
 * @returns {Element|null} - The parent element.
 */
export const parent = (element) => {
    return element.parentElement;
}

/**
 * Replaces an element in the DOM with another element.
 *
 * @param {Element} newElement - Element to replace another element.
 * @param {Element} oldElement - Element to be replaced by the newElement.
 * @returns {Element} The new element.
 */
export const replaceElement = (newElement, oldElement) => {
    parent(oldElement).replaceChild(newElement, oldElement);
    return newElement;
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
}

/**
 * Gets scrollable ancestor of an element (body element is not included).
 *
 * @param {Element} element - Element.
 * @param {array<Element|Document>} scrollables - Array of scrollable Elements.
 * @returns {array<Element|Document>}
 */
export const getScrollableAncestors = (element, scrollables = [ROOT]) => {
    element = parent(element);
    if (! element || element === ROOT.body) {
        return scrollables;
    }

    if (/auto|scroll/.test(getComputedStyle(element).overflow)) {
        scrollables.push(element);
    }

    return getScrollableAncestors(element, scrollables);
}



/**
 * Check if an element is visible in the viewport of all scrollable elements.
 *
 * @param {Element} element - Element.
 * @param {Array} scrollables - Scrollable elements.
 * @returns {boolean}
 */
export const isInViewport = (element, scrollables) => {
    return scrollables.every(scrollable => {
        let { x: elementX, y: elementY, bottom: elementBottom, right: elementRight } = getBounds(element);
        let { x: scrollableX, y: scrollableY, bottom: scrollableBottom, right: scrollableRight } = getBounds(scrollable);

        return elementY >= scrollableY && elementBottom <= scrollableBottom && elementX <= scrollableRight && elementRight >= scrollableX;
    });
}


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
 * Hides/Shows element.
 * 
 * @param {Element} element - Element to show/hide.
 * @param {boolean} toggler - Whether to show (true) or hide the element.
 */
export const toggleVisibility = (element, toggler = true) => {
    element.style.display = toggler ? '' : 'none';
}

/**
 * Adds/Removes a class to/from an based on a boolean variable.
 *
 * @param {Element} element - Element.
 * @param {string} token - Class name.
 * @param {boolean} toggler - Whether to add (true) or remove a class.
 */
export const toggleClassName = (element, token, toggler = true) => {
    if (token) {
        element.classList.toggle(token, toggler);
    }
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
    return createElement(BUTTON, className, targetElement, merge({ type: BUTTON }, details), insertPosition);
}