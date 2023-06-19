/**
 * Attach an event listener to an element.
 *
 * @param {EventTarget} target - Event target.
 * @param {string} event - Event type.
 * @param {EventListenerOrEventListenerObject} listener - Event listener.
 */
export const addEvent = (target, event, listener) => {
    target.addEventListener(event, listener);
}

/**
 * Removes event listener from an element.
 *
 * @param {EventTarget} target - Event target.
 * @param {string} event - Event type.
 * @param {EventListenerOrEventListenerObject} listener - Event listener.
 */
export const removeEvent = (target, event, listener) => {
    target.removeEventListener(event, listener);
}

