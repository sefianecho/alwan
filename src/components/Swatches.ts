import type Alwan from "..";
import { caretSVG } from "../assets/svg";
import { CLICK } from "../constants";
import type { ISwatches } from "../types";
import {
    createButton,
    createDivElement,
    setColorProperty,
    toggleClassName,
    addEvent,
} from "../utils/dom";
import { getColorObjectFormat, isString } from "../utils";
import { isArray } from "../utils/object";
import { stringify } from "../stringify";

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
                "alwan__swatches",
                swatches.map((color) => {
                    const str = isString(color)
                        ? color
                        : stringify(color, getColorObjectFormat(color as {}));
                    const button = createButton(
                        buttons.swatch,
                        "alwan__swatch",
                        "",
                        str,
                    );

                    setColorProperty(button, str);

                    addEvent(button, CLICK, () =>
                        alwan.s._parse(str, true, true),
                    );

                    return button;
                }),
            );

            if (!toggleSwatches) {
                return container;
            }

            collapseFn = (collapse = !isCollapsed) => {
                isCollapsed = collapse;
                toggleClassName(container!, "alwan--collapse", isCollapsed);
                alwan.c._reposition();
            };

            collapseButton = createButton(
                buttons.toggleSwatches,
                "alwan__toggle-button",
                caretSVG,
            );
            addEvent(collapseButton, CLICK, () => collapseFn());
            collapseFn(isCollapsed);

            return createDivElement("", [container, collapseButton]);
        },
    };
};
