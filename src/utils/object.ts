import { isset } from './is';

export const { keys, assign: merge, setPrototypeOf, prototype } = Object;
export const { from: toArray, isArray } = Array;

/**
 * @param value - Value to check if it's an object.
 * @returns - Whether value is an object or not.
 */
export const isPlainObject = (obj: unknown) =>
    isset(obj) && typeof obj === 'object' && !isArray(obj);

/**
 * Calls a function for each key-value pair in a given object.
 *
 * @param object - Object to iterate.
 * @param callbackFn - A function to execute for each key-value pair.
 */
export const ObjectForEach = <T extends {}>(
    object: T,
    callbackFn: (key: keyof T, value: T[keyof T]) => void
) => (<Array<keyof T>>keys(object)).forEach((key) => callbackFn(key, object[key]));

/**
 * Merges Two objects with nested objects.
 *
 * @param target - Object to merge the source object properties to.
 * @param source - Object containing the properties to merge.
 * @returns - The target object.
 */
export const deepMerge = <T extends {}, U extends {}>(target: T, source: U): T & U => {
    ObjectForEach(source, (key, value) => {
        if (isset(value)) {
            merge(target, {
                [key]: isPlainObject(value)
                    ? deepMerge(target[key as unknown as keyof T & U] || {}, value)
                    : value,
            });
        }
    });
    return <T & U>target;
};
