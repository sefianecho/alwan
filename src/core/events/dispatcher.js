import { CHANGE, CLOSE, COLOR, OPEN } from "../../constants/globals"
import { merge, objectIterator } from "../../utils/object";
import { isset } from "../../utils/is";

/**
 * Alwan events.
 *
 * @param {Alwan} alwan - Alwan Instance.
 * @returns
 */
export const Dispatcher = (alwan) => {
    /**
     * Alwan event listeners.
     */
    const listeners = {
        [OPEN]: [],
        [CLOSE]: [],
        [CHANGE]: [],
        [COLOR]: []
    }

    return {
        /**
         * Dispatch an event.
         *
         * @param {string} type - Alwan event.
         * @param {object} ev - Event object.
         */
        _dispatch(type, source) {
            if (! alwan.config.disabled) {
                (listeners[type] || []).forEach(handler => {
                    handler(merge({ type, source }, alwan._color._value()));
                });
            }
        },

        /**
         * Add an event listener.
         *
         * @param {string} event - Alwan event.
         * @param {Function} listener - Event listener callback.
         */
        _addListener(event, listener) {
            if (listeners[event] && ! listeners[event].includes(listener)) {
                listeners[event].push(listener);
            }
        },

        /**
         * Remove event listener(s).
         *
         * @param {string} event - Alwan event.
         * @param {Function} listener - Event listener callback.
         */
        _removeListeners(event, listener) {
            if (! isset(event)) {
                // Remove all listeners if event is undefined.
                objectIterator(listeners, (_array, alwanEvent) => {
                    listeners[alwanEvent] = [];
                });
            } else if (listeners[event]) {
                if (isset(listener)) {
                    // Remove the given listener.
                    listeners[event] = listeners[event].filter((fn) => fn !== listener);
                } else {
                    // Remove all listeners of a given event if listener is undefined.
                    listeners[event] = [];
                }
            }
        }
    }
}