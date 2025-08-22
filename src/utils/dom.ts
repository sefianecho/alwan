import { BUTTON, DOC_ELEMENT, INPUT, ROOT } from "../constants";
import type { Attrs, DOMRectArray, EventBinder } from "../types";
import { isElement, isNumber, isString } from ".";
import { ObjectForEach, isArray } from "./object";

export const getBody = () => ROOT.body;

export const getElements = (
    reference: string | Element,
    context: Element = DOC_ELEMENT,
) => {
    if (isString(reference) && reference.trim()) {
        return [...context.querySelectorAll(reference)];
    }
    // Reference must be an element in the page.
    if (isElement(reference)) {
        return [reference];
    }

    return [];
};

export const getInteractiveElements = (context: HTMLElement) =>
    getElements(`${INPUT},${BUTTON},[tabindex]`, context) as Array<
        HTMLInputElement | HTMLButtonElement
    >;

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
        (name, value) => {
            if (isNumber(value) || value) {
                element.setAttribute(name, value + "");
            }
        },
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

export const setColorProperty = (
    element: HTMLElement | SVGElement,
    color: string,
) => element.style.setProperty("--color", color);

export const toggleClassName = (
    element: Element,
    token: string,
    forced?: boolean,
) => element.classList.toggle(token, forced);

export const translate = (element: HTMLElement, x: number, y: number) => {
    element.style.transform = `translate(${x}px,${y}px)`;
};

export const getBoundingRectArray = (
    element: Element,
    isContentBox?: boolean,
): DOMRectArray => {
    let { x, y, width, height } = element.getBoundingClientRect();

    if (isContentBox) {
        x += element.clientLeft - element.scrollLeft;
        y += element.clientTop - element.scrollTop;
    }

    return [x, y, width, height, width + x, height + y];
};

export const createContainer = (children: Array<Element | null | undefined>) =>
    createDivElement("alwan__container", children);

export const setElementVisibility = (
    element: HTMLElement | SVGElement,
    hidden?: boolean,
) => (element.style.display = hidden ? "none" : "");

const isContainingBlock = ({
    transform,
    perspective,
    filter,
    containerType,
    backdropFilter,
    willChange,
    contain,
}: CSSStyleDeclaration) =>
    transform !== "none" ||
    perspective !== "none" ||
    containerType !== "normal" ||
    backdropFilter !== "none" ||
    filter !== "none" ||
    (willChange && /\b(transform|perspective|filter)\b/.test(willChange)) ||
    (contain && /\b(paint|layout|strict|content)\b/.test(contain));

const topLayerSelectors = [":popover-open", ":modal"] as const;
const isTopLayer = (node: Node) =>
    isElement(node) &&
    topLayerSelectors.some((selector) => {
        try {
            return node.matches(selector);
        } catch (_) {
            return false;
        }
    });

export const getOffsetParentBoundingRect = (
    node: Node | null,
    root: ShadowRoot | null,
): number[] => {
    node = node && node.parentNode;

    if (!node || node === ROOT || isTopLayer(node)) {
        return [0, 0];
    }

    if (node === root) {
        node = root.host;
    }

    if (isElement(node) && isContainingBlock(getComputedStyle(node))) {
        return getBoundingRectArray(node, true);
    }

    return getOffsetParentBoundingRect(node, root);
};

export const addEvent: EventBinder = (target, type, listener, options) =>
    target.addEventListener(type, listener as EventListener, options);

export const removeEvent: EventBinder = (target, type, listener) =>
    target.removeEventListener(type, listener as EventListener);
