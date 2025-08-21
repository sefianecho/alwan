import { HSL_FORMAT, RGB_FORMAT } from "../constants";

export const isString = (value: unknown): value is string =>
    typeof value === "string";

export const isElement = (value: unknown): value is Element =>
    value instanceof Element;

export const isNumber = (value: unknown) =>
    Number.isFinite(isString(value) && value.trim() !== "" ? +value : value);

export const getColorObjectFormat = (colorObj: Record<PropertyKey, unknown>) =>
    [HSL_FORMAT, RGB_FORMAT].find((format) =>
        [...format].every((channel) => isNumber(colorObj[channel])),
    );
