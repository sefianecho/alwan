import { BUTTON_CLASSNAME, SLIDER_CLASSNAME } from "../constants/classnames";
import { BUTTON, DOC_ELEMENT, INPUT, ROOT } from "../constants/globals";
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
        width = right = DOC_ELEMENT.clientLeft;
        height = bottom = DOC_ELEMENT.clientHeight;
    } else {
        ({ x, y, width, height, right, bottom } = element.getBoundingClientRect());
    }

    return [x, y, width, height, right, bottom];
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

        return elementY < scrollableBottom && elementBottom > scrollableY && elementX < scrollableRight && elementRight > scrollableX;
    });
}


/**
 * Sets a CSS custom property.
 *
 * @param {HTMLElement} el  - Element to set its custom property.
 * @param {string} property - Property name.
 * @param {string} value    - Property value.
 */
export const setCustomProperty = (element, property, value) => {
    if (element && isset(value)) {
        element.style.setProperty(property, value);
    }
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
 * @param {Element} parent - Sldier parent.
 * @param {number} max - Max property.
 * @param {number} step - Step property.
 * @returns {HTMLInputElement} - Slider.
 */
export const createSlider = (className, parent, max, step) => {
    return createElement(INPUT, SLIDER_CLASSNAME + ' ' + className, parent, { type: 'range', max, step });
}