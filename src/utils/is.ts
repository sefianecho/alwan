export const isString = (value: unknown): value is string =>
	typeof value === "string";

export const isset = <T>(value: T): value is NonNullable<T> => value != null;

export const isElement = (value: unknown): value is Element =>
	value instanceof Element;

export const isNumber = (value: unknown) =>
	Number.isFinite(isString(value) && value.trim() !== "" ? +value : value);

export const isFunction = (value: unknown): value is Function =>
	typeof value === "function";

export const isHex = (value: string) => /^[\da-f]+$/i.test(value);
