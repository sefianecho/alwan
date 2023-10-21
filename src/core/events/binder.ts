import type { EventListenerBinder } from '../../types';

/**
 * Attach an event listener to an element.
 *
 * @param target Event target.
 * @param type - Event type.
 * @param listener - Event handler.
 */
export const addEvent: EventListenerBinder = (target, type, listener) => {
    target.addEventListener(type, listener);
};

/**
 * Removes event listener from an element.
 *
 * @param target Event target.
 * @param type - Event type.
 * @param listener - Event handler.
 */
export const removeEvent: EventListenerBinder = (target, type, listener) => {
    target.removeEventListener(type, listener);
};
