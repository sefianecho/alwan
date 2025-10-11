import { DEFAULT_COLOR, RGB_FORMAT } from "./constants";
import type { HSLA, RGBA, colorDetails, colorFormat } from "./types";

// Returns the default color if the format is invalid (empty string).
export const stringify = (
    color: colorDetails | HSLA | RGBA,
    format: colorFormat | "" = RGB_FORMAT,
) =>
    format
        ? format +
          (format === RGB_FORMAT
              ? `(${(<RGBA>color).r}, ${(<RGBA>color).g}, ${(<RGBA>color).b}`
              : `(${(<HSLA>color).h}, ${(<HSLA>color).s}%, ${(<HSLA>color).l}%`) +
          (color.a < 1 ? `, ${color.a})` : ")")
        : DEFAULT_COLOR;
