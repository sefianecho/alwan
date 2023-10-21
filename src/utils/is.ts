/**
 * Checks if a value is a string.
 *
 * @param value - Value to check.
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Checks if a value is not undefined or null.
 *
 * @param value - Value.
 */
export const isset = <T>(value: T): value is NonNullable<T> => value != null;

/**
 * Checks if a value is an Element.
 *
 * @param value - Any value.
 */
export const isElement = (value: unknown): value is Element => value instanceof Element;
