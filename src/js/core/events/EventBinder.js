import { isString } from "../../utils/util";

/**
 * Bind/Unbind event listeners.
 *
 * @returns {Object}
 */
export const EventBinder = () => {
    /**
     * Events map to store events.
     * 
     * An event is stored as an array [events, handler, options],
     * EventMap takes an element as a key and array of events as a value.
     */
    const eventMap = new Map();

    /**
     * Adds/Removes one or more event listeners to/from an element.
     *
     * @param {targetElement} targetElement - Event target element.
     * @param {Array} eventData - Event data (type, handler, options).
     * @param {String} method - Add or Remove event listener method.
     */
    const binder = (targetElement, eventData, method) => {

        let [events, handler, options] = eventData;

        // If its a single event then put it inside an array.
        if (isString(events)) {
            events = [events];
        }

        events.forEach(event => {
            targetElement[method](event, handler, options);
        });
    }


    return {
        /**
         * Stores events in a map and bind one or more event listeners to an element.
         *
         * @param {targetElement} targetElement - Event target element.
         * @param {String|Array} events - Event(s) type(s)
         * @param {CallableFunction} handler - Event handler.
         * @param {Object|Boolean} options - Event options.
         */
        on: (targetElement, events, handler, options) => {

            if (targetElement) {

                let eventData = [events, handler, options || false];
                // Get element's events array.
                let elementEvents = eventMap.get(targetElement);
                // If the element has events then append the new event to the events array,
                // otherwise create a new array containing the new event.
                eventMap.set(targetElement, elementEvents ? elementEvents.push(eventData) && elementEvents : [eventData]);

                binder(targetElement, eventData, 'addEventListener');
            }
        },

        /**
         * Removes all event listeners.
         */
        clear: () => {
            eventMap.forEach((events, targetElement) => {
                events.forEach(eventData => binder(targetElement, eventData, 'removeEventListener'));
            });
        }
    }
}