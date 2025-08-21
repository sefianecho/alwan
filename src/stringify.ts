import { RGB_FORMAT } from "./constants";
import type { HSLA, RGBA, colorDetails } from "./types";

export const stringify = (
    color: colorDetails | HSLA | RGBA,
    format = RGB_FORMAT,
) =>
    format +
    (format === RGB_FORMAT
        ? `(${(<RGBA>color).r}, ${(<RGBA>color).g}, ${(<RGBA>color).b}`
        : `(${(<HSLA>color).h}, ${(<HSLA>color).s}%, ${(<HSLA>color).l}%`) +
    (color.a < 1 ? `, ${color.a})` : ")");
