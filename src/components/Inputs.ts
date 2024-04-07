import type Alwan from '..';
import { switchInputsSVG } from '../assets/svg';
import { CONTAINER_CLASSNAME, INPUTS_CLASSNAME, INPUT_CLASSNAME } from '../constants/classnames';
import {
    CHANGE,
    CLICK,
    COLOR_FORMATS,
    ENTER,
    FOCUS_IN,
    HEX_FORMAT,
    INPUT,
    KEY_DOWN,
} from '../constants/globals';
import { addEvent } from '../core/events/binder';
import { stringify } from '../lib/colors/stringify';
import type { HSLA, IInputs, InputFormats, RGBA, colorDetails, colorFormat } from '../types';
import {
    appendChildren,
    createButton,
    createDivElement,
    createElement,
    setHTML,
} from '../utils/dom';
import { max } from '../utils/math';
import { ObjectForEach } from '../utils/object';

/**
 * Creates inputs.
 *
 * @param param0 - Alwan instance.
 * @returns - Inputs component.
 */
export const Inputs = (alwan: Alwan): IInputs => {
    let { config, _color: colorState } = alwan;
    let container: HTMLDivElement | null;
    let inputsWrapper: HTMLDivElement | null;
    let switchButton: HTMLButtonElement | null;
    let formats: colorFormat[] = [];
    let currentFormatIndex: number;
    let inputsMap: Partial<Record<keyof colorDetails, HTMLInputElement>>;
    let isChanged = false;
    let isSingle: boolean;

    /**
     * Handles inputs change.
     */
    const handleChange = () => {
        let color: Partial<Record<keyof colorDetails, number | string>> = {};
        let format = formats[currentFormatIndex];

        if (!isChanged) {
            colorState._cache();
            isChanged = true;
        }

        ObjectForEach(inputsMap, (key, input) =>
            color[key] = input!.value
        );

        colorState._setColor(
            isSingle ?
                <string>(color[format]) :
                stringify(<RGBA | HSLA>color, format),
            false
        );
    };

    /**
     * Builds inputs.
     */
    const build = () => {
        if (inputsWrapper) {
            // Initialize inputs map.
            inputsMap = {};
            // Remove all inputs.
            setHTML(inputsWrapper, '');
            isSingle = formats[currentFormatIndex] === HEX_FORMAT || config.singleInput;
            // Each letter in the format variable represent a color channel,
            // For multiple inputs, each color channel has an input field.
            // e.g. for 'rgb' format fields array is [r, g, b] or [r, g, b, a] if opacity is true.
            const format = formats[currentFormatIndex];
            const fields = isSingle ? [format] : (format + (config.opacity ? 'a' : '')).split('');
            const colorValue = colorState._value;

            appendChildren(inputsWrapper, ...fields.map(field => {
                inputsMap[<keyof colorDetails>field] = createElement(
                    INPUT,
                    INPUT_CLASSNAME,
                    [],
                    '',
                    {
                        type: 'text',
                        value: colorValue[<keyof colorDetails>field]
                    }
                );
                return createElement('label', '', [
                    inputsMap[<keyof colorDetails>field]!,
                    createElement('span', '', [], field)
                ]);
            }));
        }
    }

    /**
     * Changes color format.
     */
    const changeFormat = () => {
        // Increment input format index, reset it if it reaches the end.
        // this index will point to the next format.
        currentFormatIndex = (currentFormatIndex + 1) % formats.length;
        colorState._setFormat(formats[currentFormatIndex]);
        build();
    };

    return {
        /**
         * Creates and initialize inputs.
         *
         * @param param0 - Options.
         */
        _init({ inputs, format, i18n }) {
            // Initialize element.
            container = inputsWrapper = switchButton = null;
            formats = COLOR_FORMATS;

            if (inputs !== true) {
                inputs = inputs || {};
                formats = formats.filter((format) => (<InputFormats>inputs)[format]);
            }
            const length = formats.length;
            if (!length) {
                formats = COLOR_FORMATS;
            }
            currentFormatIndex = max(formats.indexOf(format), 0);
            colorState._setFormat(formats[currentFormatIndex]);
            if (length) {
                if (length > 1) {
                    switchButton = createButton(
                        i18n.buttons.changeFormat,
                        '',
                        switchInputsSVG
                    );
                    addEvent(switchButton, CLICK, changeFormat);
                }
                inputsWrapper = createDivElement(INPUTS_CLASSNAME);
                container = createDivElement(CONTAINER_CLASSNAME, inputsWrapper, switchButton);

                /**
                 * Inputs events.
                 */
                addEvent(inputsWrapper, INPUT, handleChange);
                addEvent(inputsWrapper, CHANGE, () => {
                    colorState._change();
                    isChanged = false;
                });
                addEvent(inputsWrapper, FOCUS_IN, (e: Event) => (<HTMLInputElement>e.target).select());
                // Pressing Enter causes the picker to close.
                addEvent( inputsWrapper, KEY_DOWN, (e: Event) => (e as KeyboardEvent).key === ENTER && alwan._app._toggle(false));

                build();
            }

            return container;
        },

        /**
         * Sets inputs values.
         *
         * @param color - Color.
         */
        _setValues(color) {
            if (!isChanged) {
                ObjectForEach(inputsMap || {}, (key, input) =>
                    input!.value = color[key] + ''
                );
            }
        },
    };
};
