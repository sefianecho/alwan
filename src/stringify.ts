import type { HSLA, RGBA, colorDetails } from "./types";

export const stringify = (color: colorDetails | HSLA | RGBA, isHSL?: boolean) =>
    (isHSL
        ? `hsl(${(<HSLA>color).h}, ${(<HSLA>color).s}%, ${(<HSLA>color).l}%`
        : `rgb(${(<RGBA>color).r}, ${(<RGBA>color).g}, ${(<RGBA>color).b}`) +
    (color.a < 1 ? `, ${color.a})` : ")");
