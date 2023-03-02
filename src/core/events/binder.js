import { isString } from "../../utils/string";

/**
 * Adds event listeners to an element and stores its data.
 *
 * @returns {object}
 */
export const Binder = () => {
    /**
     * Stores event listeners data.
     */
    let eventListenersData = [];

    /**
     * Adds/Removes event listeners.
     *
     * @param {EventTarget} eventTarget - Event target.
     * @param {array<string>} events - Events (event type)
     * @param {Function} handler - Event handler.
     * @param {boolean} toggler - add/remove event listener.
     */
    let toggleEventListener = (eventTarget, events, handler, toggler = true) => {
        events.forEach(event => {
            eventTarget[`${toggler?`add`:`remove`}EventListener`](event, handler);
        });
    }

    return {
        /**
         * binds an event listener to an element.
         *
         * @param {EventTarget} eventTarget - Event target.
         * @param {string|Array<string>} events - Event(s)
         * @param {Function} handler - Event handler.
         */
        _bind(eventTarget, events, handler) {
            if (isString(events)) {
                events = [events];
            }
            eventListenersData.push([eventTarget, events, handler]);
            toggleEventListener(eventTarget, events, handler);
        },

        /**
         * Removes all event listeners and clears their data.
         */
        _unbindAll() {
            eventListenersData.forEach(([target, events, handler]) => {
                toggleEventListener(target, events, handler, false);
            });
            eventListenersData = [];
        }
    }
}