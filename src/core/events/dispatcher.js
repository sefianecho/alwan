import { CHANGE, CLOSE, COLOR, OPEN } from "../../constants"
import { merge } from "../../utils/object";
import { isset } from "../../utils/util";

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
         * @param {string} type - Event type.
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
         * @param {string} eventType - Event type.
         * @param {CallableFunction} eventHandler - Event handler to registered.
         */
        _addListener(eventType, eventHandler) {
            if (listeners[eventType]) {
                listeners[eventType].push(eventHandler);
            }
        },

        /**
         * Remove event listener(s).
         *
         * @param {string} type - Event type.
         * @param {CallableFunction} handlerToRemove - Event handler to remove.
         */
        _removeListeners(eventType, handlerToRemove) {

            let handlers = eventType && listeners[eventType];

            if (isset(eventType)) {
                if (handlers) {
                    if (isset(handlerToRemove)) {
                        listeners[eventType] = handlers.filter((handler => handler !== handlerToRemove));
                    } else {
                        listeners[eventType] = [];
                    }
                }
            } else {
                objectIterator(listeners, (_array, eventType) => {
                    listeners[eventType] = [];
                });
            }
        }
    }
}