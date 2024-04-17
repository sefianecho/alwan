import { BUTTON_CLASSNAME, SLIDER_CLASSNAME } from '../constants/classnames';
import {
    ARIA_LABEL,
    BUTTON,
    DOC_ELEMENT,
    INPUT,
    ROOT,
} from '../constants/globals';
import type { Attrs, DOMRectArray } from '../types';
import { isElement, isNumber, isString } from './is';
import { ObjectForEach, toArray } from './object';

export let BODY_ELE: HTMLElement;

/**
 * Initialize body element variable.
 */
export const initBodyElement = () => {
    BODY_ELE = ROOT.body;
}

/**
 * Gets element.
 *
 * @param reference - CSS selector or a HTML element.
 * @param context - Element to search from.
 */
export const getElements = (reference: string | Element, context: Element = DOC_ELEMENT) => {
    if (isString(reference) && reference.trim()) {
        return toArray(context.querySelectorAll(reference));
    }
    // Reference must be an element in the page.
    if (isElement(reference)) {
        return [reference];
    }

    return [];
};

/**
 * Checks if an element is in the body element.
 *
 * @param element - Any element.
 * @returns - boolean.
 */
export const isElementInBody = (element: Element) => 
    element !== BODY_ELE &&
    BODY_ELE.contains(element);

/**
 * Gets interactive elements (inputs, buttons and elements with tabindex attribute).
 *
 * @param context - Element to search from.
 * @returns - Interactive elements (focusable).
 */
export const getInteractiveElements = (context: HTMLElement) =>
    getElements(`${INPUT},${BUTTON},[tabindex]`, context);

/**
 * Appends elements as children to an element.
 *
 * @param element - Element.
 * @param children - Array of elements.
 * @returns - void.
 */
export const appendChildren = (element: Element, ...children: Array<Element | null>) =>
    element.append(...(children.filter(child => child) as Array<Element>));

/**
 * Sets element's inner html.
 *
 * @param element - An HTML element.
 * @param html - HTML string.
 */
export const setHTML = (element: Element, html: string) => {
    element.innerHTML = html;
};

/**
 * Sets element attribute.
 *
 * @param el - Element to set its attribute.
 * @param name - Attribute name.
 * @param value - Attribute value.
 */
export const setAttribute = (el: Element | null, name: string, value: string | number) => {
    if (el && (isNumber(value) || value)) {
        el.setAttribute(name, value + '');
    }
};

/**
 * Creates a new HTML Element.
 *
 * @param tagName - Element tag name.
 * @param className - Element class name.
 * @param children - Array of elements to add as children.
 * @param attributes - Element Attributes.
 * @returns The newly created element.
 */
export const createElement = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    className?: string,
    children: Array<Element | null> = [],
    content?: string,
    attributes?: Attrs,
) => {
    const element = ROOT.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (content) {
        setHTML(element, content);
    }

    ObjectForEach(attributes || {}, (name, value) =>
        setAttribute(element, name, value)
    );

    appendChildren(element, ...children);

    return element;
};

/**
 * Creates a div element.
 *
 * @param classname - Element classname.
 * @param children - Array of elements to add as children.
 * @param attributes - Element attributes.
 * @returns - New div element.
 */
export const createDivElement = (
    classname: string,
    ...children: Array<Element | null>
) => createElement('div', classname, children);

/**
 * Removes element form the DOM.
 *
 * @param element - Element to remove.
 */
export const removeElement = (element: Element) => element.remove();

/**
 * Replaces an element in the DOM with another element.
 *
 * @param element - Element to be replaced by another node.
 * @param replacement - A node to replace the element.
 * @returns - Replacement node.
 */
export const replaceElement = (element: Element, replacement: Element) => {
    element.replaceWith(replacement);
    return replacement;
};

/**
 * Creates a button Element.
 *
 * @param label - Button aria label.
 * @param className - Class.
 * @param content - Button innert html.
 * @param title - Button title.
 * @returns - A new button element.
 */
export const createButton = (
    label: string = '',
    className?: string,
    content?: string,
    title: string = label,
) => {
    return createElement(
        BUTTON,
        BUTTON_CLASSNAME + className,
        [],
        content,
        {
            type: BUTTON,
            [ARIA_LABEL]: label,
            title,
        }
    );
};

/**
 * Creates a range input.
 *
 * @param classname - Slider classname.
 * @param max - Slider max value.
 * @param step - Slider step.
 * @returns - Slider element.
 */
export const createSlider = (classname: string, max: number, step = 1) =>
    createElement(INPUT, SLIDER_CLASSNAME + classname, [], '', { max, step, type: 'range' });

/**
 * Sets a CSS custom property to an element.
 *
 * @param element  - Element to set its CSS custom property.
 * @param property - Custom property name.
 * @param value    - Custom property value.
 * @returns - Element.
 */
export const setCustomProperty = (
    element: HTMLElement | SVGAElement | null,
    property: string,
    value: string | number
) => {
    if (element) {
        element.style.setProperty('--' + property, value + '');
    }
    return element;
};

/**
 * Adds/Removes a class to/from an based on a boolean variable.
 *
 * @param element - Element.
 * @param token - Class to add or to remove.
 * @param forced - Whether to add (true), remove (false) or toggle (undefined) classnames .
 */
export const toggleClassName = (element: Element, token: string, forced?: boolean) =>
    element.classList.toggle(token, forced);

/**
 * Translates an element.
 *
 * @param element - Element to translate.
 * @param x - X coordinate.
 * @param y - Y coordinate.
 */
export const translate = (element: HTMLElement, x: number, y: number) => {
    element.style.transform = `translate(${x}px,${y}px)`;
};

/**
 * Gets overflow ancestor of an element (body element is not included).
 *
 * @param {Element} element - Element.
 * @param {array<Element|Document>} ancestors - Array of overflow ancestors.
 * @returns {array<Element|Document>}
 */
export const getOverflowAncestors = (
    element: Element | null,
    ancestors: Array<Document | Element> = [ROOT]
): typeof ancestors => {
    if (element) {
        element = element.parentElement;
    }

    if (!element || element === BODY_ELE) {
        return ancestors;
    }

    if (/auto|scroll|overflow|clip|hidden/.test(getComputedStyle(element).overflow)) {
        ancestors.push(element);
    }

    return getOverflowAncestors(element, ancestors);
};

/**
 * Gets element's bounding rect.
 *
 * @param element - Element.
 * @returns - Element's bounds.
 */
export const getBounds = (element: Document | Element): DOMRectArray => {
    let x, y, width, height, right, bottom;

    if (!isElement(element)) {
        x = y = 0;
        width = right = DOC_ELEMENT.clientWidth;
        height = bottom = DOC_ELEMENT.clientHeight;
    } else {
        ({ x, y, width, height, right, bottom } = element.getBoundingClientRect());
    }

    return [x, y, width, height, right, bottom];
};

/**
 * Checks if target element is in the viewport.
 *
 * @param target - Element to check its visibility.
 * @param overflowAncestors - Overflow ancestors of the target.
 * @returns - Is element in the viewport.
 */
export const isInViewport = (target: Element, overflowAncestors: Array<Element | Document>) => {
    return overflowAncestors.every((ancestor) => {
        const [x, y, , , right, bottom] = getBounds(target);
        const [ancestorX, ancestorY, , , ancestorRight, ancestorBottom] = getBounds(ancestor);

        return y < ancestorBottom && bottom > ancestorY && x < ancestorRight && right > ancestorX;
    });
};
