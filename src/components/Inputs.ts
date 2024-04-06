import type Alwan from '..';
import { switchInputsSVG } from '../assets/svg';
import { INPUTS_CLASSNAME, INPUT_CLASSNAME } from '../constants/classnames';
import {
    CHANGE,
    CLICK,
    COLOR_FORMATS,
    ENTER,
    FOCUS_IN,
    HEX_FORMAT,
    INPUT,
    INPUTS_ID,
    KEY_DOWN,
} from '../constants/globals';
import { addEvent } from '../core/events/binder';
import { stringify } from '../lib/colors/stringify';
import type { HSLA, IInputs, InputFormats, RGBA, colorDetails, colorFormat } from '../types';
import {
    appendChildren,
    createButton,
    createContainer,
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

    /**
     * Checks if inputs are one single input.
     */
    const isSingle = () => {
        return config.singleInput || formats[currentFormatIndex] === HEX_FORMAT;
    };

    /**
     * Handles inputs change.
     *
     * @param e - Input & Change event.
     */
    const handleChange = (e: Event) => {
        let str = (<HTMLInputElement>e.target).value;
        let color: Partial<Record<keyof colorDetails, number>> = {};

        if (!isChanged) {
            colorState._cache();
            isChanged = true;
        }

        if (!isSingle()) {
            ObjectForEach(inputsMap, (key, input) => {
                color[key] = +input!.value;
            });
            str = stringify(<RGBA | HSLA>color, formats[currentFormatIndex]);
        }
        colorState._setColor(str, INPUTS_ID, false, true);
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
            // Each letter in the format variable represent a color channel,
            // For multiple inputs, each color channel has an input field.
            // e.g. for 'rgb' format fields array is [r, g, b] or [r, g, b, a] if opacity is true.
            const format = formats[currentFormatIndex];
            const fields = isSingle() ? [format] : (format + (config.opacity ? 'a' : '')).split('');
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
                        '',
                        switchInputsSVG,
                        {},
                        i18n.buttons.changeFormat
                    );
                    addEvent(switchButton, CLICK, changeFormat);
                }
                inputsWrapper = createDivElement(INPUTS_CLASSNAME);
                // Create container and insert it after the util-sliders container.
                container = createContainer([inputsWrapper, switchButton]);
                addEvent(inputsWrapper, INPUT, handleChange);
                /**
                * Handle change stop.
                */
                addEvent(inputsWrapper, CHANGE, () => {
                    colorState._change();
                    isChanged = false;
                });
                // Select value on focus.
                addEvent(inputsWrapper, FOCUS_IN, (e) => (<HTMLInputElement>e.target).select());
                // Close picker on Enter key press.
                addEvent(
                    inputsWrapper,
                    KEY_DOWN,
                    (e) => (e as KeyboardEvent).key === ENTER && alwan._app._toggle(false)
                );
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
            ObjectForEach(inputsMap || {}, (key, input) => {
                input!.value = color[key] + '';
            });
        },
    };
};
