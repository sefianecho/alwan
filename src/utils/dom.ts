import { BUTTON, DOC_ELEMENT, INPUT, ROOT } from "../constants";
import type { Attrs, DOMRectArray, EventBinder } from "../types";
import { isElement, isNumber, isString } from ".";
import { ObjectForEach, isArray } from "./object";

export const getBody = () => ROOT.body;

export const getElements = <T extends Element>(
    reference: string | T,
    context: Element = DOC_ELEMENT,
): T[] => {
    if (isString(reference) && reference.trim()) {
        return [...context.querySelectorAll<T>(reference)];
    }
    // Reference must be an element in the page.
    if (isElement(reference)) {
        return [reference];
    }

    return [];
};

export const getInteractiveElements = (context: HTMLElement) =>
    getElements<HTMLInputElement | HTMLButtonElement>(
        `${INPUT},${BUTTON},[tabindex]`,
        context,
    );

export const createElement = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    className?: string,
    content?: string | Node | null | Array<Node | undefined | null>,
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
                ...(isArray(content) ? content : [content]).filter(
                    (child): child is Node => !!child,
                ),
            );
        }
    }

    ObjectForEach(
        ariaLabel ? { ...attributes, "aria-label": ariaLabel } : attributes,
        (name, value) => {
            if (isNumber(value) || value) {
                element.setAttribute(name, value + "");
            }
        },
    );

    return element;
};

export const createDivElement = (
    children?: Node | null | string | Array<Node | null | undefined>,
    className?: string,
    ariaLabel?: string,
) => createElement("div", className, children, {}, ariaLabel);

export const replaceElement = <T extends Element>(
    element: Element | undefined,
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
) => {
    return createElement(
        BUTTON,
        "alwan__button " + className,
        content,
        {
            type: BUTTON,
            title,
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

export const setColorProperty = (
    element: HTMLElement | SVGElement,
    color: string,
) => element.style.setProperty("--color", color);

export const toggleModifierClass = (
    element: Element,
    token: string,
    forced?: boolean,
) => element.classList.toggle("alwan--" + token, forced);

export const translate = (element: HTMLElement, x: number, y: number) => {
    element.style.transform = `translate(${x}px,${y}px)`;
};

export const getBoundingRectArray = (element: Element): DOMRectArray => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return [x, y, width, height, width + x, height + y];
};

export const createContainer = (children: Array<Node | null | undefined>) =>
    createDivElement(children, "alwan__container");

export const hideElement = (
    element: HTMLElement | SVGElement,
    hidden?: boolean,
) => (element.style.display = hidden ? "none" : "");

export const addEvent: EventBinder = (target, type, listener, options) =>
    target.addEventListener(type, listener as EventListener, options);

export const removeEvent: EventBinder = (target, type, listener) =>
    target.removeEventListener(type, listener as EventListener);
