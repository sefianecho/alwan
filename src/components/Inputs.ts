import type Alwan from '..';
import { switchInputsSVG } from '../assets/svg';
import { INPUTS_CLASSNAME, INPUT_CLASSNAME } from '../constants/classnames';
import {
    CHANGE,
    CLICK,
    COLOR_FORMATS,
    FOCUS_IN,
    HEX_FORMAT,
    INPUT,
    INPUTS_ID,
    INSERT_AFTER,
    INSERT_BEFORE_FIRST_CHILD,
} from '../constants/globals';
import { addEvent } from '../core/events/binder';
import { stringify } from '../lib/colors/stringify';
import type { HSLA, IInputs, InputFormats, RGBA, colorDetails, colorFormat } from '../types';
import {
    createButton,
    createContainer,
    createDivElement,
    createElement,
    removeElement,
} from '../utils/dom';
import { float, max } from '../utils/math';
import { ObjectForEach } from '../utils/object';

/**
 * Creates inputs.
 *
 * @param param0 - Alwan instance.
 * @param targetElement - Element to insert the inputs component to.
 * @returns - Inputs component.
 */
export const Inputs = (
    { config, _color: colorState }: Alwan,
    targetElement: HTMLElement
): IInputs => {
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
        const target = e.target as HTMLInputElement;
        let str = target.value;
        let color: Partial<Record<keyof colorDetails, number>> = {};

        if (e.type === CHANGE) {
            colorState._change(target);
            isChanged = false;
        } else {
            if (!isChanged) {
                colorState._cache();
                isChanged = true;
            }

            if (!isSingle()) {
                ObjectForEach(inputsMap, (key, input) => {
                    color[key] = float(input!.value);
                });
                str = stringify(<RGBA | HSLA>color, formats[currentFormatIndex]);
            }
            colorState._setColor(str, target, INPUTS_ID);
        }
    };

    /**
     * Builds inputs.
     */
    const build = () => {
        // Initialize inputs map.
        inputsMap = {};
        // Create inputs container.
        removeElement(inputsWrapper);
        inputsWrapper = createDivElement(
            INPUTS_CLASSNAME,
            container,
            {},
            INSERT_BEFORE_FIRST_CHILD
        );
        // Each letter in the format variable represent a color channel,
        // For multiple inputs, each color channel has an input field.
        // e.g. for 'rgb' format fields array is [r, g, b] or [r, g, b, a] if opacity is true.
        const format = formats[currentFormatIndex];
        const fields = isSingle() ? [format] : (format + (config.opacity ? 'a' : '')).split('');
        const colorValue = colorState._value;

        fields.forEach((field) => {
            /**
             * Create Input.
             *
             * <label>
             *     <input type="text" class="alwan__input">
             *     <span>${field}</span>
             * </label>
             */
            const labelElement = createElement('label', '', inputsWrapper);
            inputsMap[<keyof colorDetails>field] = createElement(
                INPUT,
                INPUT_CLASSNAME,
                labelElement,
                '',
                {
                    type: 'text',
                    value: colorValue[<keyof colorDetails>field] + '',
                }
            );
            createElement('span', '', labelElement, field);
        });

        addEvent(inputsWrapper, INPUT, handleChange);
        addEvent(inputsWrapper, CHANGE, handleChange);
        // Select value on focus.
        addEvent(inputsWrapper, FOCUS_IN, (e) => (<HTMLInputElement>e.target).select());
        // addEvent(
        //     inputsWrapper,
        //     KEY_DOWN,
        //     (e) => (e as KeyboardEvent).key === ENTER &&
        // );
    };

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
            container = removeElement(container);
            switchButton = removeElement(switchButton);
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
                // Create container and insert it after the util-sliders container.
                container = createContainer(targetElement, INSERT_AFTER);
                build();
                if (length > 1) {
                    switchButton = createButton(
                        '',
                        container,
                        switchInputsSVG,
                        {},
                        i18n.buttons.changeFormat
                    );
                    addEvent(switchButton, CLICK, changeFormat);
                }
            }
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
