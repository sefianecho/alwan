import { ESCAPE, KEY_DOWN, POINTER_DOWN, RESIZE, ROOT, SCROLL, TAB } from '../constants/globals';
import { addEvent, removeEvent } from '../core/events/binder';
import type {
    EventListenerBinder,
    IPopover,
    LabeledElement,
    alignment,
    alwanApp,
    alwanConfig,
    side,
} from '../types';
import {
    getBounds,
    getInteractiveElements,
    getOverflowAncestors,
    isInViewport,
    translate,
} from '../utils/dom';
import { isNumber, isString, isset } from '../utils/is';
import { abs, round } from '../utils/math';
import { toArray } from '../utils/object';

// getBounds function array.
const LEFT = 0; // Also the x coordinate.
const TOP = 1; // Also the y coordinate.
const RIGHT = 4;
const BOTTOM = 5;

const START = 0;
const CENTER = 1;
const END = 2;

/**
 * Sides to fallback to for each side.
 */
const fallbackSides: Record<side, number[]> = {
    top: [TOP, BOTTOM, RIGHT, LEFT],
    bottom: [BOTTOM, TOP, RIGHT, LEFT],
    right: [RIGHT, LEFT, TOP, BOTTOM],
    left: [LEFT, RIGHT, TOP, BOTTOM],
};

/**
 * Alignments to fallback to for each alignment.
 */
const fallbackAlignments: Record<alignment, number[]> = {
    start: [START, CENTER, END],
    center: [CENTER, START, END],
    end: [END, CENTER, START],
};

/**
 * Creates a popover instance.
 *
 * @param target - Popover target.
 * @param container - Popover container.
 * @param reference - Alwan reference element.
 * @param param3 - Alwan options.
 * @param param4 - App component.
 * @returns - Popover instance.
 */
export const createPopover = (
    target: Element,
    container: HTMLElement,
    reference: Element,
    { margin, position, toggle, closeOnScroll }: alwanConfig,
    { _isOpen, _toggle }: alwanApp
): IPopover => {
    margin = isNumber(margin) ? +margin : 0;
    const [side, alignment] = <[side, alignment]>(isString(position) ? position.split('-') : []);
    const sidesFlipOrder = fallbackSides[side] || fallbackSides.bottom;
    const alignmentsFlipOrder = fallbackAlignments[alignment] || fallbackAlignments.center;
    const overflowAncestors = getOverflowAncestors(target);
    const containerStyle = container.style;
    /**
     * Updates the container's position.
     */
    const _update = () => {
        containerStyle.height = '';
        const visualViewport = getBounds(ROOT);
        const targetBounds = getBounds(target);
        const containerBounds = getBounds(container);
        const coordinates: [x: number | null, y: number | null] = [null, null];
        /**
         * Check sides.
         */
        sidesFlipOrder.some((side) => {
            // Get axis of the side.
            // x (0) if side is LEFT (1) or RIGHT (4).
            // y (1) if side is TOP (0) or BOTTOM (5).
            let axis = side % 2;
            // Viewport side.
            const domSide = visualViewport[side];
            // Target element coordinate.
            const targetSide = targetBounds[side];
            // Space required for the container.
            // Adding 2 to the axis index gives the dimension based on the axis,
            // x => width and y => height.
            const requiredSpace = margin + containerBounds[axis + 2];

            if (requiredSpace <= abs(domSide - targetSide)) {
                // Calculate coordinate to set this side.
                // side <= 1 means side is either TOP or LEFT.
                // otherwise it's BOTTOM or RIGHT.
                coordinates[axis] = targetSide + (side <= 1 ? -requiredSpace : margin);
                // Reverse the axis for the alignments.
                // x (0) => y (1)
                // y (1) => x (0)
                axis = (axis + 1) % 2;
                const containerDimension = containerBounds[axis + 2];
                // Lower bound is either the TOP | LEFT coordinate and,
                // the Upper bound is either the BOTTOM | RIGHT coordinates of the target element.
                // depends on the axis.
                const targetLowerBound = targetBounds[axis];
                const targetUpperBound = targetBounds[axis + 4];
                // Distance between the document upper bound (BOTTOM or RIGHT) and,
                // the target element lower bound (TOP or LEFT).
                const upperBoundDistance = visualViewport[axis + 4] - targetLowerBound;
                // Offset between the container and the reference element.
                const offset = (containerDimension + targetBounds[axis + 2]) / 2;

                /**
                 * Check alignments, only if the container is attached to one side.
                 */
                alignmentsFlipOrder.some((alignment) => {
                    // Check space, if it's available then align the container.
                    if (alignment === START && containerDimension <= upperBoundDistance) {
                        coordinates[axis] = targetLowerBound;
                        return true;
                    }
                    if (
                        alignment === CENTER &&
                        offset <= targetUpperBound &&
                        offset <= upperBoundDistance
                    ) {
                        coordinates[axis] = targetUpperBound - offset;
                        return true;
                    }
                    if (alignment === END && containerDimension <= targetUpperBound) {
                        coordinates[axis] = targetUpperBound - containerDimension;
                        return true;
                    }
                    return false;
                });

                return true;
            }
        });

        // If there is no space to position the popover in all sides,
        // then center the popover in the screen.
        // If the popover is attached to one side but there is no space,
        // for the alignment then center it horizontally/vertically depends on the side.
        translate(
            container,
            ...(<[x: number, y: number]>coordinates.map((value, axis) => {
                if (axis && value === null) {
                    containerStyle.height = visualViewport[5] - 6 /** Gap*2 */ + 'px';
                    containerBounds[3] =
                        visualViewport[5] -
                        3 /** Gap between the window and the container top-bottom edges */;
                }

                return round(
                    isset(value)
                        ? value
                        : (visualViewport[axis + 4] - containerBounds[axis + 2]) / 2
                );
            }))
        );
    };

    /**
     * Auto updates popover position and picker visibility when the window resizes or,
     * one of the ancestors of the target element scrolls.
     */
    const autoUpdate = () => {
        if (_isOpen() || !toggle) {
            if (isInViewport(target, overflowAncestors)) {
                if (_isOpen()) {
                    // Update popover position if its target element is in the viewport,
                    // and picker is open.
                    _update();

                    if (closeOnScroll) {
                        _toggle(false);
                    }
                } else {
                    // This is reachable only if toggle is false,
                    // open picker if the popover target element becomes visible in the viewport.
                    _toggle(true, true);
                }
            } else {
                // Force close picker if the target element is not in the viewport.
                _toggle(false, true);
            }
        }
    };

    /**
     * Handles keyboard accessibility.
     *
     * @param e - Keyboard event.
     */
    const handleKeyboard = (e: Event) => {
        if (_isOpen()) {
            const { target, key, shiftKey } = e as KeyboardEvent;
            // Close picker when pressing the Escape key.
            if (key === ESCAPE) {
                _toggle(false);
            } else if (key === TAB) {
                const focusableElements = getInteractiveElements(container);
                const firstFocusableElement = focusableElements[0];
                const lastFocusableElement = focusableElements.pop();
                const elementToFocusOn =
                    // Pressing Tab while focusing on the reference element sends focus,
                    // to the first element (palette) inside the picker container.
                    target === reference && !shiftKey
                        ? firstFocusableElement
                        : // Pressing Tab while focusing on the palette with the shift key or focussing on the last,
                        // focusable element without shift key sends focus to the reference element (if it's focusable).
                        (shiftKey && target === firstFocusableElement) ||
                          (!shiftKey && target === lastFocusableElement)
                        ? reference
                        : null;

                if (elementToFocusOn) {
                    e.preventDefault();
                    (<HTMLElement>elementToFocusOn).focus();
                }
            }
        }
    };

    /**
     * Closes the color picker if a click (pointerdown) occurred outside the
     * popover widget.
     *
     * @param param0 - Pointerdown event.
     */
    const closePopover = ({ target }: Event) => {
        if (
            _isOpen() &&
            target !== reference &&
            !container.contains(target as Node) &&
            !toArray((<LabeledElement>reference).labels || []).some((label) =>
                label.contains(target as Node)
            )
        ) {
            _toggle(false);
        }
    };

    /**
     * Attach/Detach popover events listeners.
     *
     * @param fn - Add/Remove Event function.
     */
    const togglePopoverEvents = (fn: EventListenerBinder) => {
        overflowAncestors.forEach((ancestor) => {
            fn(ancestor, SCROLL, autoUpdate);
        });
        fn(window, RESIZE, autoUpdate);
        fn(ROOT, KEY_DOWN, handleKeyboard);
        fn(ROOT, POINTER_DOWN, closePopover);
    };

    /**
     * Remove popover functionality.
     */
    const _destroy = () => {
        // Remove all listeners.
        togglePopoverEvents(removeEvent);
        container.style.transform = '';
    };

    _update();
    // Attach listeners.
    togglePopoverEvents(addEvent);

    return {
        _update,
        _destroy,
    };
};
