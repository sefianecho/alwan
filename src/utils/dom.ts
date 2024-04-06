import { BUTTON_CLASSNAME, CONTAINER_CLASSNAME, SLIDER_CLASSNAME } from '../constants/classnames';
import {
    ARIA_LABEL,
    BUTTON,
    DOC_ELEMENT,
    INPUT,
    INSERT_AFTER_LAST_CHILD,
    ROOT,
} from '../constants/globals';
import type { Attrs, DOMRectArray } from '../types';
import { isElement, isString, isset } from './is';
import { ObjectForEach, merge, toArray } from './object';

/**
 * Gets the body element.
 *
 * @returns Document's body.
 */
export const bodyElement = () => ROOT.body;

/**
 * Gets element.
 *
 * @param reference - CSS selector or a HTML element.
 * @param context - Element to search from.
 */
export const getElements = (reference: string | Element, context: Element = bodyElement()) => {
    if (isString(reference) && reference.trim()) {
        return toArray(context.querySelectorAll(reference));
    }
    // Reference must be an element in the page.
    if (isElement(reference) && bodyElement().contains(reference) && reference !== bodyElement()) {
        return [reference];
    }

    return [];
};

/**
 * Gets interactive elements (inputs, buttons and elements with tabindex attribute).
 *
 * @param context - Element to search from.
 * @returns - Interactive elements (focusable).
 */
export const getInteractiveElements = (context: HTMLElement) =>
    getElements(`${INPUT},${BUTTON},[tabindex]`, context);

/**
 * Inserts an element relative to another element (target element).
 *
 * @param element - The element to be inserted.
 * @param targetElement - Element used as a reference.
 * @param where - Insert position relative to the targetElement.
 */
export const insertElement = (
    element: Element,
    targetElement: Element,
    where: InsertPosition = INSERT_AFTER_LAST_CHILD
) => {
    if (element && targetElement) {
        targetElement.insertAdjacentElement(where, element);
    }
};

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
    if (el) {
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

    ObjectForEach(attributes || {}, (name, value) => {
        if (isset(value)) {
            setAttribute(element, name, value);
        }
    });

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
    children?: Array<Element | null>,
    attributes?: Attrs,
) => createElement('div', classname, children, '', attributes);

/**
 * Remove element from the document.
 *
 * @param element - Element to remove.
 */
export const removeElement = (element?: Element | null) => {
    if (element) {
        element.remove();
    }

    return null;
};

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
 * @param className - Class.
 * @param content - Button innert html.
 * @param attrs - Button details.
 * @param label - Button aria label.
 * @param title - Button title.
 * @returns - A new button element.
 */
export const createButton = (
    className?: string,
    content?: string,
    attrs?: Attrs,
    label?: string,
    title?: string,
) => {
    return createElement(
        BUTTON,
        BUTTON_CLASSNAME + className,
        [],
        content,
        merge(
            {
                type: BUTTON,
                [ARIA_LABEL]: label,
                title: title || label,
            },
            attrs
        ),
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
 * Creates a container element.
 *
 * @param children - Array of elements to append as children.
 */
export const createContainer = (children?: Array<Element | null>) =>
    createDivElement(CONTAINER_CLASSNAME, children);

/**
 * Sets a CSS custom property to an element.
 *
 * @param element  - Element to set its CSS custom property.
 * @param property - Custom property name.
 * @param value    - Custom property value.
 */
export const setCustomProperty = (
    element: HTMLElement | SVGAElement | null,
    property: string,
    value: string | number
) => {
    if (element) {
        element.style.setProperty('--' + property, value + '');
    }
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

    if (!element || element === bodyElement()) {
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
