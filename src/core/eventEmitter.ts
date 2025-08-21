import Alwan from "..";
import { CHANGE, CLOSE, COLOR, OPEN } from "../constants";
import type { EventEmitter, alwanEventAndListenersMap } from "../types";
import { ObjectForEach, merge } from "../utils/object";

export const eventEmitter = (alwan: Alwan): EventEmitter => {
    const listeners: alwanEventAndListenersMap = {
        [OPEN]: [],
        [CLOSE]: [],
        [CHANGE]: [],
        [COLOR]: [],
    };

    return {
        _emit(type, value = alwan.s._value) {
            (listeners[type] || []).forEach((listener) =>
                listener(merge({ type, source: alwan }, value)),
            );
        },

        _on(event, listener) {
            if (listener && !(listeners[event] || []).includes(listener)) {
                listeners[event].push(listener);
            }
        },

        _off(event, listener) {
            if (!event) {
                // Remove all listeners.
                ObjectForEach(listeners, (event) => {
                    listeners[event] = [];
                });
            } else if (listeners[event]) {
                if (listener) {
                    listeners[event] = listeners[event].filter(
                        (fn) => fn !== listener,
                    );
                } else {
                    // Remove all listeners of the given event.
                    listeners[event] = [];
                }
            }
        },
    };
};
