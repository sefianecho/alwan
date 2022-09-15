import { CHANGE, CLOSE, COLOR, OPEN } from "../../constants";
import { objectIterator } from "../../utils/object";

/**
 * Picker Events.
 *
 * @returns {Object}
 */
export const EventListener = (alwan) => {

    /**
     * Picker event listeners.
     */
    const listeners = {
        [OPEN]: [],
        [CLOSE]: [],
        [CHANGE]: [],
        [COLOR]: []
    }

    return {
        /**
         * Emits an event.
         *
         * @param {String} type - Event type.
         * @param  {Element|Object} source - Event Source.
         */
        emit: (type, source) => {
            if (! alwan.config.disabled && listeners[type]) {
                listeners[type].forEach(handler => {
                    if (type === COLOR || type === CHANGE) {
                        handler(alwan._s.value, source || alwan);
                    } else {
                        handler();
                    }
                });
            }
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
                objectIterator(listeners, (handlers, type) => {
                    listeners[type] = [];
                });
            }
        }
    }
}