import Alwan from '../..';
import { CHANGE, CLOSE, COLOR, OPEN } from '../../constants/globals';
import type { EventEmitter, alwanEventAndListenersMap } from '../../types';
import { isset } from '../../utils/is';
import { ObjectForEach, merge } from '../../utils/object';

/**
 * Alwan event Emitter.
 */
export const Emitter = (alwan: Alwan): EventEmitter => {
    /**
     * Alwan event listeners.
     */
    const listeners: alwanEventAndListenersMap = {
        [OPEN]: [],
        [CLOSE]: [],
        [CHANGE]: [],
        [COLOR]: [],
    };

    return {
        /**
         * Dispatches an event.
         *
         * @param type - Event type
         * @param value - Color value.
         */
        _emit(type, value = alwan._color._value) {
            if (!alwan.config.disabled) {
                (listeners[type] || []).forEach((listener) => {
                    listener(merge({ type, source: alwan }, value));
                });
            }
        },

        /**
         * Add an event listener.
         *
         * @param event - Alwan event.
         * @param listener - Event listener callback.
         */
        _on(event, listener) {
            if (listeners[event] && !listeners[event].includes(listener)) {
                listeners[event].push(listener);
            }
        },

        /**
         * Remove event listener(s).
         *
         * @param event - Alwan event.
         * @param listener - Event listener callback.
         */
        _off(event, listener) {
            if (!isset(event)) {
                // Remove all listeners if event is undefined.
                ObjectForEach(listeners, (event) => {
                    listeners[event] = [];
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
        },
    };
};
