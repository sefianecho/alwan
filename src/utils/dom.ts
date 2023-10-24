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
 * @param all - Select all elements.
 */
export const getElement = (reference: string | Element, context: Element = bodyElement()) => {
    if (isString(reference) && reference.trim()) {
        return context.querySelector(reference);
    }
    // Reference must be an element in the page.
    if (isElement(reference) && bodyElement().contains(reference) && reference !== bodyElement()) {
        return reference;
    }

    return null;
};

/**
 * Gets an array of elements selected by a CSS selector.
 *
 * @param selector - CSS selector.
 * @param context - Element to search from.
 * @returns - Array of elements.
 */
export const getAllElements = (selector: string, context: ParentNode) => {
    return toArray(context.querySelectorAll(selector));
};

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
 * @param targetElement - Insert the new element relative to this element using position.
 * @param attributes - Element Attributes.
 * @param insertPosition - Insert position.
 * @returns The new created element.
 */
export const createElement = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    className?: string,
    targetElement?: Element | null,
    content?: string,
    attributes?: Attrs,
    insertPosition?: InsertPosition
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

    if (targetElement) {
        insertElement(element, targetElement, insertPosition);
    }

    return element;
};

/**
 * Creates a div element.
 *
 * @param classname - Element classname.
 * @param targetElement - Insert the new element relative to this element using position.
 * @param attributes - Element attributes.
 * @param insertPosition - Insert position.
 * @returns - New div element.
 */
export const createDivElement = (
    classname: string,
    targetElement?: Element | null,
    attributes?: Attrs,
    insertPosition?: InsertPosition
) => createElement('div', classname, targetElement, '', attributes, insertPosition);

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
 * @param targetElement - TargetElement.
 * @param attrs - Button details.
 * @param label - Button label.
 * @param title - Button title.
 * @param insertPosition - Button insert position.
 * @returns - A new button element.
 */
export const createButton = (
    className?: string,
    targetElement?: HTMLElement | null,
    content?: string,
    attrs?: Attrs,
    label?: string,
    title?: string,
    insertPosition?: InsertPosition
) => {
    return createElement(
        BUTTON,
        BUTTON_CLASSNAME + ' ' + className,
        targetElement,
        content,
        merge(
            {
                type: BUTTON,
                [ARIA_LABEL]: label,
                title: title || label,
            },
            attrs
        ),
        insertPosition
    );
};

/**
 * Creates an input type range (slider).
 *
 * @param className - CSS class.
 * @param parent - Slider parent.
 * @param max - Max property.
 * @param step - Step property.
 * @returns - A new range input.
 */
export const createRangeInput = (className: string, parent: Element, max: string, step: string) => {
    return createElement(INPUT, SLIDER_CLASSNAME + ' ' + className, parent, '', {
        type: 'range',
        max,
        step,
    });
};

/**
 * Creates a container element.
 *
 * @param targetElement - Element used as a reference.
 * @param where - Insert position relative to the targetElement
 */
export const createContainer = (targetElement: Element, where?: InsertPosition) => {
    return createDivElement(CONTAINER_CLASSNAME, targetElement, {}, where);
};

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
 * @param tokens - Class name or array of classes.
 * @param toggler - Whether to add (true) or remove classnames.
 */
export const toggleClassNames = (
    element: Element,
    tokens: string | string[],
    toggler?: boolean
) => {
    if (isString(tokens)) {
        tokens = [tokens];
    }

    tokens.forEach((token) => {
        if (token) {
            element.classList.toggle(token, toggler);
        }
    });
};

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
