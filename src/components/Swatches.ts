import type Alwan from "..";
import { caretSVG } from "../assets/svg";
import { parseColor } from "../colors/parser";
import { CLICK, COLOR } from "../constants/globals";
import { addEvent } from "../core/events/binder";
import type { ISwatches } from "../types";
import {
    createButton,
    createDivElement,
    setCustomProperty,
    toggleClassName,
} from "../utils/dom";
import { isString } from "../utils/is";
import { isArray } from "../utils/object";

export const Swatches = (alwan: Alwan): ISwatches => {
    let isCollapsed = false;

    return {
        _init({ swatches, toggleSwatches, i18n: { buttons } }) {
            let container: HTMLDivElement | undefined;
            let collapseButton: HTMLButtonElement | undefined;
            let collapseFn: (collapse?: boolean) => void;

            if (!isArray(swatches) || !swatches.length) {
                return container;
            }

            container = createDivElement(
                "alwan__swatches",
                swatches.map((color) =>
                    setCustomProperty(
                        createButton(
                            buttons.swatch,
                            "alwan__swatch",
                            "",
                            isString(color)
                                ? color
                                : (parseColor(color, true) as string),
                        ),
                        COLOR,
                        parseColor(color, true) as string,
                    ),
                ),
            );

            // Handles clicks in the swatches container.
            addEvent(container, CLICK, ({ target }) => {
                if (target !== container) {
                    alwan._color._setColor(
                        (<HTMLButtonElement>target).style.getPropertyValue(
                            "--" + COLOR,
                        ),
                        true,
                        true,
                    );
                }
            });

            if (!toggleSwatches) {
                return container;
            }

            collapseFn = (collapse = !isCollapsed) => {
                isCollapsed = collapse;
                toggleClassName(container!, "alwan--collapse", isCollapsed);
                alwan._app._reposition();
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
