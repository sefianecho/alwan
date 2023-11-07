import { BACKDROP_CLASSNAME } from '../constants/classnames';
import {
    BLUR,
    DOC_ELEMENT,
    POINTER_DOWN,
    POINTER_MOVE,
    POINTER_UP,
    ROOT,
} from '../constants/globals';
import { addEvent, removeEvent } from '../core/events/binder';
import { toggleClassName } from '../utils/dom';

/**
 * Drags and moves an element.
 *
 * @param target - Drag target.
 * @param dragStart - Drag start callback.
 * @param dragMove - Drag move callback.
 * @param dragEnd - Drag end (release) callback.
 * @param windowBlur - Window blur while dragging callback.
 */
export const Draggable = (
    target: HTMLElement,
    dragStart: (ev: PointerEvent) => void,
    dragMove: (ev: PointerEvent) => void,
    dragEnd: (ev: PointerEvent) => void,
    windowBlur: EventListenerOrEventListenerObject
) => {
    /**
     * Drag handler to add or remove.
     *
     * @param e - PointerEvent.
     */
    const drag = (e: Event) => {
        if ((<PointerEvent>e).buttons) {
            dragMove(e as PointerEvent);
        } else {
            // If pointer is up but the pointerup event didn't fire then
            // remove dragging.
            setDragging(false);
        }
    };

    /**
     * Handles drag end (release).
     *
     * @param e - PointerEvent.
     */
    const handleDragEnd = (e: Event) => {
        dragEnd(e as PointerEvent);
        setDragging(false);
    };

    /**
     * Set/Unset dragging by adding/removing pointermove event and add/remove
     * the backdrop.
     *
     * @param dragging - Whether to set (true) or unset (false) dragging.
     */
    const setDragging = (dragging: boolean) => {
        toggleClassName(DOC_ELEMENT, BACKDROP_CLASSNAME, dragging);
        (dragging ? addEvent : removeEvent)(ROOT, POINTER_MOVE, drag);
    };

    /**
     * Drag start.
     */
    addEvent(target, POINTER_DOWN, (e) => {
        dragStart(e as PointerEvent);
        /**
         * Drag move.
         */
        setDragging(true);

        // Handle if the window lose focus (blur) while dragging.
        addEvent(window, BLUR, windowBlur, { once: true });
        /**
         * Drag end.
         */
        addEvent(ROOT, POINTER_UP, handleDragEnd, { once: true });
    });
};
