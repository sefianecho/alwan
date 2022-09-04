import { isString } from "../../utils/util";

/**
 * Adds/Removes one or more event listeners to/from an element.
 *
 * @param {targetElement} targetElement - Event target element.
 * @param {Array} eventData - Event data (type, handler, options).
 * @param {String} method - Add or Remove event listener method.
 */
const binder = (eventData, unbind) => {

    let method = (unbind ? 'remove': 'add') + 'EventListener';
    let [targetElement, events, handler, options] = eventData;

    // If its a single event then put it inside an array.
    if (isString(events)) {
        events = [events];
    }

    events.forEach(event => {
        targetElement[method](event, handler, options);
    });
}

/**
 * Binds events to an element and stores listener in an array.
 *
 * @param {Array} listeners - Event Listeners.
 * @param {targetElement} targetElement - Event Target.
 * @param {String|Array} events - Event type.
 * @param {CallableFunction} handler - Event handler.
 * @param {Object|Boolean} options - Event options.
 * @returns {Array}
 */
export const bindEvent = (listeners, targetElement, events, handler, options) => {

    if (targetElement) {
        options = options || false;
        let eventData = [targetElement, events, handler, options];
        binder(eventData);
        listeners.push(eventData);
    }

    return listeners;
}

/**
 * Unbinds all listeners attach to an element and removes them from listeners array.
 *
 * @param {Array} listeners - Event listeners.
 * @param {targetElement} targetElement - Event Target.
 * @returns {Array}
 */
export const unbindEvent = (listeners, targetElement) =>
    // Filter out listeners attached to this TargetElement.
    listeners.filter(eventData => 
        targetElement === eventData[0] ? 
            binder(eventData, true)
            : true
    );