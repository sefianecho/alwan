import { isElement } from ".";

export const { keys, assign: merge, setPrototypeOf, prototype } = Object;
export const { isArray } = Array;

export const isPlainObject = (obj: unknown): obj is {} =>
    obj != null && typeof obj === "object" && !isArray(obj) && !isElement(obj);

export const ObjectForEach = <T extends {}>(
    object: T,
    callbackFn: (key: keyof T, value: T[keyof T]) => void,
) =>
    (<Array<keyof T>>keys(object)).forEach((key) =>
        callbackFn(key, object[key]),
    );

export const deepMerge = <T extends {}, U extends {}>(
    target: T,
    source: U,
): T & U => {
    ObjectForEach(source, (key, value) => {
        merge(target, {
            [key]: isPlainObject(value)
                ? deepMerge(target[key as unknown as keyof T & U] || {}, value)
                : value,
        });
    });
    return <T & U>target;
};
