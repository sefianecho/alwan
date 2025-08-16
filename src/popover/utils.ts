import { DOC_ELEMENT, ROOT } from "../constants";
import { getBody, getBoundingRectArray, getParentElement } from "../utils/dom";

export const isInViewport = (
    target: Element,
    overflowAncestors: Array<Element | Document>,
) => {
    return overflowAncestors.every((ancestor) => {
        const [x, y, , , right, bottom] = getBoundingRectArray(target);
        const [ancestorX, ancestorY, , , ancestorRight, ancestorBottom] =
            getBoundingRectArray(ancestor);

        return (
            y < ancestorBottom &&
            bottom > ancestorY &&
            x < ancestorRight &&
            right > ancestorX
        );
    });
};

const isContainingBlock = (element: Element) => {
    const isWebkit =
        !(typeof CSS === "undefined" || !CSS.supports) &&
        CSS.supports("-webkit-backdrop-filter", "none");
    const {
        transform,
        perspective,
        filter,
        containerType,
        backdropFilter,
        willChange = "",
        contain = "",
    } = getComputedStyle(element);

    return (
        transform !== "none" ||
        perspective !== "none" ||
        containerType !== "normal" ||
        (!isWebkit && backdropFilter !== "none") ||
        (!isWebkit && filter !== "none") ||
        /transform|perspective|filter/.test(willChange) ||
        /paint|layout|strict|content/.test(contain)
    );
};

export const getOverflowAncestors = (
    element: Element,
    ancestors: Array<Document | Element> = [ROOT],
): typeof ancestors => {
    element = getParentElement(element);

    if (element === getBody()) {
        return ancestors;
    }

    const { display, overflow } = getComputedStyle(element);

    if (
        /auto|scroll|overflow|clip|hidden/.test(overflow) &&
        !["inline", "contents"].includes(display)
    ) {
        ancestors.push(element);
    }

    return getOverflowAncestors(element, ancestors);
};

export const getOffsetParent = (element: Element): Element | Document => {
    element = getParentElement(element);

    if (isContainingBlock(element)) {
        return element;
    }

    if (element === DOC_ELEMENT || isTopLayer(element)) {
        return ROOT;
    }

    return getOffsetParent(element);
};

const topLayerSelectors = [":popover-open", ":modal"] as const;
const isTopLayer = (element: Element) =>
    topLayerSelectors.some((selector) => {
        try {
            return element.matches(selector);
        } catch (e) {
            return false;
        }
    });
