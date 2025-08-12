import type { EventBinder } from "../../types";

export const addEvent: EventBinder = (target, type, listener, options) =>
    target.addEventListener(type, listener as EventListener, options);

export const removeEvent: EventBinder = (target, type, listener) =>
    target.removeEventListener(type, listener as EventListener);
