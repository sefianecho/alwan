import type Alwan from "..";
import { caretSVG } from "../assets/svg";
import { CLICK } from "../constants";
import type { ISwatches, Color } from "../types";
import {
    createButton,
    createDivElement,
    setColorProperty,
    toggleModifierClass,
    addEvent,
} from "../utils/dom";
import { getColorObjectFormat, isString } from "../utils";
import { isArray } from "../utils/object";
import { stringify } from "../stringify";

export const isCombinedColorLabelObject = (value: unknown): value is { color: Color, label?: string } =>
    typeof value === "object" && value !== null && "color" in value;

export const Swatches = (alwan: Alwan): ISwatches => {
    let isCollapsed = false;

    return {
        _render({ swatches, toggleSwatches, i18n: { buttons } }) {
            let container: HTMLDivElement | undefined;
            let collapseButton: HTMLButtonElement | undefined;
            let collapseFn: (collapse?: boolean) => void;

            if (!isArray(swatches) || !swatches.length) {
                return container;
            }

            container = createDivElement(
                swatches.map((swatch) => {
                    const { color, label } = isCombinedColorLabelObject(swatch)
                        ? swatch
                        : { color: swatch as Color, label: undefined };
                    const str = isString(color)
                        ? color
                        : stringify(color, getColorObjectFormat(color as {}));
                    const button = createButton(
                        buttons.swatch,
                        "alwan__swatch",
                        "",
                        label ?? str,
                    );

                    setColorProperty(button, str);

                    addEvent(button, CLICK, () =>
                        alwan.s._parse(str, true, true),
                    );

                    return button;
                }),
                "alwan__swatches",
            );

            if (!toggleSwatches) {
                return container;
            }

            collapseFn = (collapse = !isCollapsed) => {
                isCollapsed = collapse;
                toggleModifierClass(container!, "collapse", isCollapsed);
                alwan.c._reposition();
            };

            collapseButton = createButton(
                buttons.toggleSwatches,
                "alwan__toggle-button",
                caretSVG,
            );
            addEvent(collapseButton, CLICK, () => collapseFn());
            collapseFn(isCollapsed);

            return createDivElement([container, collapseButton]);
        },
    };
};
