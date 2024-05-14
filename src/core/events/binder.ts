import type { EventListenerBinder } from "../../types";

export const addEvent: EventListenerBinder = (
	target,
	type,
	listener,
	options,
) => target.addEventListener(type, listener, options);

export const removeEvent: EventListenerBinder = (target, type, listener) =>
	target.removeEventListener(type, listener);
