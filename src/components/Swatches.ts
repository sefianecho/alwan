import type Alwan from "..";
import { caretSVG } from "../assets/svg";
import { parseColor } from "../colors/parser";
import {
    COLLAPSE_BUTTON_CLASSNAME,
    COLLAPSE_CLASSNAME,
    SWATCHES_CLASSNAME,
    SWATCH_CLASSNAME,
} from "../constants/classnames";
import { CLICK, COLOR } from "../constants/globals";
import { addEvent } from "../core/events/binder";
import type { ISwatches } from "../types";
import {
    createButton,
    createDivElement,
    joinClassnames,
    setCustomProperty,
    toggleClassName,
} from "../utils/dom";
import { isString } from "../utils/is";
import { isArray } from "../utils/object";

export const Swatches = (alwan: Alwan): ISwatches => {
    let container: HTMLDivElement | null;
    let swatchesContainer: HTMLDivElement | null;
    let collapseButton: HTMLButtonElement | null;
    let isCollapsed = false;

    return {
        _init({ swatches, toggleSwatches, i18n: { buttons } }) {
            if (!isArray(swatches)) {
                return container;
            }

            container = swatchesContainer = collapseButton = null;

            if (!swatches.length) {
                return container;
            }

            swatchesContainer = container = createDivElement(
                joinClassnames(
                    SWATCHES_CLASSNAME,
                    toggleSwatches && isCollapsed ? COLLAPSE_CLASSNAME : "",
                ),
                swatches.map((color) =>
                    // Sets custom property on the created button and returns it (the button).
                    setCustomProperty(
                        createButton(
                            buttons.swatch,
                            SWATCH_CLASSNAME,
                            "",
                            isString(color)
                                ? color
                                : <string>parseColor(color, true),
                        ),
                        COLOR,
                        <string>parseColor(color, true),
                    ),
                ),
            );

            if (toggleSwatches) {
                collapseButton = createButton(
                    buttons.toggleSwatches,
                    COLLAPSE_BUTTON_CLASSNAME,
                    caretSVG,
                );
                // Handles toggle swatches button click.
                addEvent(collapseButton, CLICK, () => {
                    isCollapsed = !isCollapsed;
                    toggleClassName(
                        <Element>swatchesContainer,
                        COLLAPSE_CLASSNAME,
                        isCollapsed,
                    );
                    alwan._app._reposition();
                });

                container = createDivElement("", [
                    swatchesContainer,
                    collapseButton,
                ]);
            }

            // Handles clicks in the swatches container.
            addEvent(swatchesContainer, CLICK, ({ target }: Event) => {
                if (target !== swatchesContainer) {
                    alwan._color._setColor(
                        (<HTMLButtonElement>target).style.getPropertyValue(
                            "--" + COLOR,
                        ),
                        true,
                        true,
                    );
                }
            });

            return container;
        },
    };
};
