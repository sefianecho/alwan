import type Alwan from "..";
import { switchInputsSVG } from "../assets/svg";
import {
    CHANGE,
    CLICK,
    COLOR_FORMATS,
    ENTER,
    FOCUS_IN,
    HEX_FORMAT,
    INPUT,
    KEY_DOWN,
} from "../constants/globals";
import { addEvent } from "../core/events/binder";
import type { Color, IInputs, colorDetails, colorFormat } from "../types";
import {
    createButton,
    createContainer,
    createDivElement,
    createElement,
    replaceElement,
} from "../utils/dom";
import { max } from "../utils/math";
import { ObjectForEach } from "../utils/object";

export const Inputs = (alwan: Alwan): IInputs => {
    let { config, _color: colorState } = alwan;
    let inputsMap: Partial<Record<keyof colorDetails, HTMLInputElement>>;
    let inputsFormat: colorFormat;
    let isChanged = false;

    const handleChange = () => {
        const color: Partial<Record<keyof colorDetails, number | string>> = {};

        if (!isChanged) {
            colorState._cache();
            isChanged = true;
        }

        ObjectForEach(inputsMap, (key, input) => (color[key] = input!.value));
        colorState._setColor((color[inputsFormat] || color) as Color, true);
    };

    const build = () => {
        inputsMap = {};
        const fields =
            inputsFormat === HEX_FORMAT || config.singleInput
                ? [inputsFormat]
                : [...(inputsFormat + (config.opacity ? "a" : ""))];
        /**
         * returns:
         *
         * <div class="alwan__inputs">
         *     <label>
         *          <input type="text" class="alwan__input">
         *          <span>color component or format</span>
         *     </label>
         *     ...
         * </div>
         */
        return createDivElement(
            "alwan__inputs",
            fields.map((field) =>
                createElement("label", "", [
                    (inputsMap[field as keyof typeof inputsMap] = createElement(
                        INPUT,
                        "alwan__input",
                        [],
                        {
                            type: "text",
                            value: colorState._value[
                                field as keyof colorDetails
                            ],
                        },
                    )),
                    createElement("span", "", field),
                ]),
            ),
        );
    };

    return {
        _init({ inputs, format, i18n }) {
            let inputsGroup: HTMLDivElement;
            let inputsWrapper: HTMLDivElement;
            let formats = COLOR_FORMATS;
            let switchBtn: HTMLButtonElement | undefined;
            let inputCount: number;

            if (inputs !== true) {
                inputs = inputs || {};
                formats = formats.filter(
                    (format) => inputs[format as keyof typeof inputs],
                );
            }
            inputCount = formats.length;
            // validate the format option.
            formats = inputCount ? formats : COLOR_FORMATS;
            inputsFormat = formats[max(formats.indexOf(format), 0)];
            colorState._setFormat(inputsFormat);

            if (!inputCount) {
                return null;
            }

            if (inputCount > 1) {
                switchBtn = createButton(
                    i18n.buttons.changeFormat,
                    "",
                    switchInputsSVG,
                );
                addEvent(switchBtn, CLICK, () => {
                    inputsFormat =
                        formats[
                            (formats.indexOf(inputsFormat) + 1) % inputCount
                        ];
                    colorState._setFormat(inputsFormat);
                    inputsGroup = replaceElement(inputsGroup, build());
                });
            }

            inputsGroup = build();
            inputsWrapper = createDivElement("", [inputsGroup]);

            addEvent(inputsWrapper, INPUT, handleChange);
            addEvent(inputsWrapper, CHANGE, () => {
                colorState._change();
                isChanged = false;
            });
            addEvent(inputsWrapper, FOCUS_IN, (e: FocusEvent) =>
                (e.target as HTMLInputElement).select(),
            );
            // Pressing Enter causes the picker to close.
            addEvent(
                inputsWrapper,
                KEY_DOWN,
                (e: KeyboardEvent) =>
                    e.key === ENTER && alwan._app._toggle(false),
            );

            return createContainer([inputsWrapper, switchBtn]);
        },

        _setValues(color) {
            if (!isChanged) {
                ObjectForEach(
                    inputsMap || {},
                    (key, input) => (input!.value = color[key] + ""),
                );
            }
        },
    };
};
