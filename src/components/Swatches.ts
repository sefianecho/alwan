import type Alwan from "..";
import { caretSVG } from "../assets/svg";
import { CLICK, DEFAULT_COLOR } from "../constants";
import type { ISwatches, Color, Swatch, LabeledSwatch } from "../types";
import {
    createButton,
    createDivElement,
    setColorProperty,
    toggleModifierClass,
    addEvent,
} from "../utils/dom";
import { isString } from "../utils";
import { isArray, isPlainObject } from "../utils/object";
import { normalizeColor, normalizeColorStr } from "../parser";

const isLabeledSwatch = (value: unknown): value is LabeledSwatch =>
    isPlainObject(value) && "color" in value;

export const Swatches = (alwan: Alwan): ISwatches => {
    let isCollapsed = false;

    const renderSwatch = (swatch: Swatch, labelTemplate: string) => {
        let button: HTMLButtonElement;
        let color: Color;
        let colorStr: string;
        let label: string | undefined;

        if (isLabeledSwatch(swatch)) {
            ({ color, label } = swatch);
        } else {
            color = swatch;
        }

        colorStr = normalizeColor(color);
        colorStr =
            normalizeColorStr(colorStr) === DEFAULT_COLOR
                ? DEFAULT_COLOR
                : colorStr;
        label = isString(label) ? label : colorStr;

        button = createButton(
            labelTemplate.replace("%label%", label),
            "alwan__swatch",
            "",
            label,
        );
        setColorProperty(button, colorStr);

        addEvent(button, CLICK, () => alwan.s._parse(colorStr, true, true));

        return button;
    };

    return {
        _render({ swatches, toggleSwatches, i18n: { buttons } }) {
            let container: HTMLDivElement | undefined;
            let collapseButton: HTMLButtonElement | undefined;
            let collapseFn: (collapse?: boolean) => void;

            if (!isArray(swatches) || !swatches.length) {
                return container;
            }

            container = createDivElement(
                swatches.map((swatch) => renderSwatch(swatch, buttons.swatch)),
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
