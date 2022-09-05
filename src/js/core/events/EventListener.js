import { objectIterator } from "../../utils/object";

/**
 * Picker Events.
 *
 * @returns {Object}
 */
export const EventListener = () => {
    /**
     * Picker event listeners.
     */
    const listeners = {
        'open': [],
        'close': [],
        'change': [],
        'color': []
    }

    return {
        /**
         * Emits an event.
         *
         * @param {String} type - Event type.
         * @param  {...any} args - Event arguments.
         */
        emit: (type, ...args) => {
            listeners[type] && listeners[type].forEach(handler => handler(...args));
        },

        /**
         * Adds an event listener.
         *
         * @param {String} type - Event type.
         * @param {CallableFunction} handler - Event handler.
         */
        on: (type, handler) => {
            listeners[type] && listeners[type].push(handler);
        },

        /**
         * Remove event listener(s).
         *
         * @param {String} type - Event type.
         * @param {CallableFunction} handler - Event handler.
         */
        off: (type, handler) => {
            let handlersArray = listeners[type];

            if (handlersArray) {
                // Remove the handler if it's specified,
                // Remove all handlers of this event if handler is omitted.
                listeners[type] = handler ? handlersArray.filter(attachedHandler => attachedHandler !== handler) : [];
            } else if (type == null) {
                objectIterator(listeners, (type) => {
                    listeners[type] = [];
                });
            }
        }
    }
}