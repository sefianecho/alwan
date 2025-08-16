import { BUTTON, DOC_ELEMENT, INPUT, ROOT } from "../constants";
import type { Attrs, DOMRectArray } from "../types";
import { isElement, isNumber, isString } from ".";
import { ObjectForEach, isArray, toArray } from "./object";

export const getBody = () => ROOT.body;

export const getElements = (
    reference: string | Element,
    context: Element = DOC_ELEMENT,
) => {
    if (isString(reference) && reference.trim()) {
        return toArray(context.querySelectorAll(reference));
    }
    // Reference must be an element in the page.
    if (isElement(reference)) {
        return [reference];
    }

    return [];
};

export const getInteractiveElements = (context: HTMLElement) =>
    getElements(`${INPUT},${BUTTON},[tabindex]`, context);

export const appendChildren = (
    element: Element,
    ...children: Array<Element | null | undefined>
) => element.append(...(children.filter((child) => child) as Array<Element>));

export const setInnerHTML = (element: Element, html: string) => {
    element.innerHTML = html;
};

export const setAttribute = (
    el: Element | null,
    name: string,
    value: string | number,
) => {
    if (el && (isNumber(value) || value)) {
        el.setAttribute(name, value + "");
    }
};

export const joinClassnames = (...classnames: string[]) =>
    classnames.join(" ").trim();

export const createElement = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    className?: string,
    content?: string | Element | null | Array<Element | undefined | null>,
    attributes: Attrs = {},
    ariaLabel?: string,
) => {
    const element = ROOT.createElement(tagName);

    if (className) {
        element.className = className.trim();
    }

    if (content) {
        if (isString(content)) {
            element.innerHTML = content;
        } else {
            element.append(
                ...((isArray(content) ? content : [content]) as Node[]).filter(
                    (child) => child,
                ),
            );
        }
    }

    ObjectForEach(
        ariaLabel ? { ...attributes, "aria-label": ariaLabel } : attributes,
        (name, value) => setAttribute(element, name, value),
    );

    return element;
};

export const createDivElement = (
    ...args: [
        className?: string,
        content?: Element | null | string | Array<Element | null | undefined>,
        attrs?: Attrs,
        ariaLabel?: string,
    ]
) => createElement("div", ...args);

export const removeElement = (element: Element) => element.remove();

export const replaceElement = <T extends Element>(
    element: Element,
    replacement: T,
): T => {
    if (element && element !== replacement) {
        element.replaceWith(replacement);
    }
    return replacement;
};

export const createButton = (
    label: string = "",
    className: string = "",
    content?: string,
    title: string = label,
    attrs: Attrs = {},
) => {
    return createElement(
        BUTTON,
        "alwan__button " + className,
        content,
        {
            type: BUTTON,
            title,
            ...attrs,
        },
        label,
    );
};

export const createSlider = (
    ariaLabel: string,
    sliderName: string,
    max: number,
    step = 1,
) =>
    createElement(
        INPUT,
        "alwan__slider alwan__" + sliderName,
        "",
        {
            type: "range",
            max,
            step,
        },
        ariaLabel,
    );

export const setCustomProperty = (
    element: HTMLElement | SVGElement | null,
    property: string,
    value: string | number,
) => {
    if (element) {
        element.style.setProperty("--" + property, value + "");
    }
    return element;
};

export const toggleClassName = (
    element: Element,
    token: string,
    forced?: boolean,
) => element.classList.toggle(token, forced);

export const translate = (element: HTMLElement, x: number, y: number) => {
    element.style.transform = `translate(${x}px,${y}px)`;
};

export const getParentElement = (element: Element | Document) =>
    (element && element.parentElement) || getBody();

export const getBoundingRectArray = (
    element: Document | Element,
    addClientArea?: boolean,
): DOMRectArray => {
    let x, y, width, height, right, bottom;

    if (!isElement(element)) {
        x = y = 0;
        width = right = DOC_ELEMENT.clientWidth;
        height = bottom = DOC_ELEMENT.clientHeight;
    } else {
        ({ x, y, width, height, right, bottom } =
            element.getBoundingClientRect());
        if (addClientArea) {
            x += element.clientTop;
            y += element.clientLeft;
        }
    }

    return [x, y, width, height, right, bottom];
};

export const getShadowRoot = (node: Node | null): ShadowRoot | null => {
    if (!node || node === getBody()) {
        return null;
    }
    if (node instanceof ShadowRoot) {
        return node;
    }
    return getShadowRoot(node.parentNode);
};

export const createContainer = (children: Array<Element | null | undefined>) =>
    createDivElement("alwan__container", children);

export const setElementVisibility = (
    element: HTMLElement | SVGElement,
    hidden?: boolean,
) => (element.style.display = hidden ? "none" : "");
