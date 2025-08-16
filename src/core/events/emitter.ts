import Alwan from "../..";
import { CHANGE, CLOSE, COLOR, OPEN } from "../../constants";
import type { EventEmitter, alwanEventAndListenersMap } from "../../types";
import { isFunction, isset } from "../../utils";
import { ObjectForEach, merge } from "../../utils/object";

export const Emitter = (alwan: Alwan): EventEmitter => {
    const listeners: alwanEventAndListenersMap = {
        [OPEN]: [],
        [CLOSE]: [],
        [CHANGE]: [],
        [COLOR]: [],
    };

    return {
        _emit(type, value = alwan._color._value) {
            (listeners[type] || []).forEach((listener) =>
                listener(merge({ type, source: alwan }, value)),
            );
        },

        _on(event, listener) {
            if (
                listeners[event] &&
                !listeners[event].includes(listener) &&
                isFunction(listener)
            ) {
                listeners[event].push(listener);
            }
        },

        _off(event, listener) {
            if (!isset(event)) {
                // Remove all listeners.
                ObjectForEach(listeners, (event) => {
                    listeners[event] = [];
                });
            } else if (listeners[event]) {
                if (isset(listener)) {
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
