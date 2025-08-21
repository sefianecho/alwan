import {
    CAPTURE_PHASE,
    DOC_ELEMENT,
    ESCAPE,
    KEY_DOWN,
    POINTER_DOWN,
    RESIZE,
    ROOT,
    SCROLL,
    TAB,
} from "./constants";
import type {
    EventBinder,
    IPopover,
    LabeledElement,
    alignment,
    IController,
    alwanConfig,
    side,
} from "./types";
import {
    getBoundingRectArray,
    getOffsetParentBoundingRect,
    getInteractiveElements,
    getShadowRoot,
    translate,
    addEvent,
    removeEvent,
} from "./utils/dom";
import { isNumber, isString } from "./utils";
import { round } from "./utils/math";

// Indexes in the DOMRectArray.
const LEFT = 0; // Also the x coordinate.
const TOP = 1; // Also the y coordinate.
const HEIGHT = 3;
const RIGHT = 4;
const BOTTOM = 5;

const START = 0;
const CENTER = 1;
const END = 2;
// Margin between the popover and the window edges.
const GAP = 3;

// Sides to fallback to for each side.
const fallbackSides: Record<side, number[]> = {
    top: [TOP, BOTTOM, RIGHT, LEFT],
    bottom: [BOTTOM, TOP, RIGHT, LEFT],
    right: [RIGHT, LEFT, TOP, BOTTOM],
    left: [LEFT, RIGHT, TOP, BOTTOM],
};

// Alignments to fallback to for each alignment.
const fallbackAlignments: Record<alignment, number[]> = {
    start: [START, CENTER, END],
    center: [CENTER, START, END],
    end: [END, CENTER, START],
};

export const createPopover = (
    target: Element,
    floating: HTMLElement,
    ref: Element,
    { margin, position, closeOnScroll, toggle, disabled }: alwanConfig,
    { _toggle, _isOpen }: IController,
): IPopover => {
    margin = isNumber(margin) ? +margin : 0;
    let isTargetVisible: boolean;
    let isFloatingVisible = _isOpen();

    const [side, alignment] = (
        isString(position) ? position.split("-") : []
    ) as [side, alignment];

    const floatingStyle = floating.style;
    const shadowRoot = getShadowRoot(ref);

    const focusableElements = getInteractiveElements(floating);
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements.pop()!;

    const updatePosition = () => {
        const viewport = [DOC_ELEMENT.clientWidth, DOC_ELEMENT.clientHeight];
        const targetRect = getBoundingRectArray(target);
        const floatingRect = getBoundingRectArray(floating);
        const offsetParentRect = getOffsetParentBoundingRect(floating);

        const coordinates: [x: number, y: number] = [-1, -1];

        floatingStyle.height = "";

        // No need to update if the target element is not in the viewport.
        if (
            !isFloatingVisible ||
            !isTargetVisible ||
            targetRect[RIGHT] < 0 ||
            targetRect[BOTTOM] < 0 ||
            targetRect[LEFT] > viewport[0] /* viewport width */ ||
            targetRect[TOP] > viewport[1] /* viewport height */
        ) {
            return;
        }

        (fallbackSides[side] || fallbackSides.bottom).some((side) => {
            // side is number:
            // 0 -> Left.
            // 1 -> Top.
            // 4 -> Right.
            // 5 -> Bottom.
            // axis can be 0 (x) or 1 (y).
            // axis + 2 -> width or height.
            // axis + 4 -> Right or Left bounds.
            let axis = side % 2;
            let point =
                targetRect[side] +
                (side <= 1 ? -floatingRect[axis + 2] - margin : margin);

            if (
                point < 0 ||
                point + floatingRect[axis + 2] + margin > viewport[axis]
            ) {
                return false;
            }

            coordinates[axis] = point;
            // Reverse the axis for the alignments.
            axis = +!axis;
            return (
                fallbackAlignments[alignment] || fallbackAlignments.center
            ).some((alignment) => {
                point =
                    alignment === START
                        ? targetRect[axis]
                        : targetRect[axis + 4] -
                          (alignment === END
                              ? floatingRect[axis + 2]
                              : (floatingRect[axis + 2] +
                                    targetRect[axis + 2]) /
                                2);
                if (
                    point < 0 ||
                    point + floatingRect[axis + 2] > viewport[axis]
                ) {
                    return false;
                }

                coordinates[axis] = point;
                return true;
            });
        });

        translate(
            floating,
            ...(coordinates.map((value, axis) => {
                // Set a dynamic height if the popover height is greater than
                // the viewport height.
                if (
                    axis &&
                    value === -1 &&
                    floatingRect[HEIGHT] > viewport[axis]
                ) {
                    floatingStyle.height = viewport[axis] - GAP * 2 + "px";
                    floatingRect[HEIGHT] = viewport[axis] - GAP;
                }

                return round(
                    (value >= 0
                        ? value
                        : // center the popover relative to the viewport.
                          (viewport[axis] - floatingRect[axis + 2]) / 2) -
                        offsetParentRect[axis],
                );
            }) as [number, number]),
        );
    };

    if (toggle) {
        addEvent(floating, KEY_DOWN, (e) => {
            let { key, target, shiftKey } = e;
            let focusElement: HTMLElement | undefined;

            if (key === ESCAPE) {
                _toggle(false);
            } else if (key === TAB) {
                if (target === firstFocusableElement && shiftKey) {
                    focusElement = lastFocusableElement;
                } else if (target === lastFocusableElement && !shiftKey) {
                    focusElement = firstFocusableElement;
                }
                if (focusElement) {
                    focusElement.focus();
                    e.preventDefault();
                }
            }
        });
    }

    const closeByPointer = ({ target }: PointerEvent) => {
        if (
            isFloatingVisible &&
            // Alwan reference element in a shadow dom and target is the shadow root.
            (!shadowRoot || target !== shadowRoot.host) &&
            ![ref, floating, ...((ref as LabeledElement).labels || [])].some(
                (node) => node.contains(target as Node),
            )
        ) {
            _toggle(false);
        }
    };

    const observer = new IntersectionObserver(([entry]) => {
        isTargetVisible = entry.isIntersecting;
        // When the popover target becomes visible:
        //   - Open it if toggle is false, otherwise restore its previous state.
        // otherwise:
        //   - Close it.
        _toggle(
            !disabled && isTargetVisible && (!toggle || isFloatingVisible),
            true,
        );
    });

    const updatePositionOnScroll = () => {
        updatePosition();
        if (closeOnScroll) {
            _toggle(false);
        }
    };

    /**
     * Adds/Removes events.
     */
    const bindEventListeners = (fn: EventBinder) => {
        fn(window, RESIZE, updatePosition);
        fn(ROOT, SCROLL, updatePositionOnScroll, CAPTURE_PHASE);
        fn(ROOT, POINTER_DOWN, closeByPointer);
        if (shadowRoot) {
            fn(shadowRoot, POINTER_DOWN, closeByPointer);
            fn(shadowRoot, SCROLL, updatePositionOnScroll, CAPTURE_PHASE);
        }
    };

    observer.observe(target);
    bindEventListeners(addEvent);

    return {
        _isVisible: () => isTargetVisible,
        _reposition(isOpenNow, wasOpenBefore) {
            isFloatingVisible = isOpenNow;
            if (isTargetVisible) {
                updatePosition();
                if (toggle && wasOpenBefore !== isOpenNow) {
                    (isOpenNow
                        ? firstFocusableElement
                        : (ref as HTMLElement)
                    ).focus();
                }
            }
        },
        _destroy() {
            observer.unobserve(target);
            bindEventListeners(removeEvent);
        },
    };
};
