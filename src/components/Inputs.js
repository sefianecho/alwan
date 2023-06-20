import { switchInputsSVG } from "../assets/svg";
import { INPUTS_CLASSNAME, INPUT_CLASSNAME } from "../constants/classnames";
import { stringify } from "../colors/stringify";
import {
    CHANGE,
    CLICK,
    COLOR,
    COLOR_FORMATS,
    FOCUS_IN,
    HEX_FORMAT,
    INPUT,
    INSERT_AFTER,
    INSERT_BEFORE_FIRST_CHILD,
    KEY_DOWN
} from "../constants/globals";
import { createButton, createContainer, createElement, removeElement } from "../utils/dom";
import { float, max } from "../utils/number";
import { objectIterator } from "../utils/object";
import { addEvent } from "../core/events/binder";

/**
 * Creates Inputs.
 *
 * @param {Element} ref - Insert outer container relative to this element.
 * @param {Object} alwan - Alwan instance.
 * @returns {Object} - Inputs component.
 */
export const Inputs = (ref, alwan) => {

    /**
     * Outer container.
     *
     * @type {HTMLDivElement | null}
     */
    let container;

    /**
     * Inputs wrapper.
     *
     * @type {HTMLDivElement | null}
     */
    let inputsContainer;

    /**
     * Switch button.
     *
     * @type {HTMLButtonElement | null}
     */
    let switchButton;

    /**
     * Inputs color formats.
     */
    let formats = [];

    /**
     * Current color format index.
     *
     * @type {number}
     */
    let currentFormatIndex;

    /**
     * Object that maps fields label to their inputs.
     *
     * @type {object}
     */
    let inputsMap;

    /**
     * Indicates that an input value has changed.
     */
    let isChanged = false;

    /**
     * Checks if inputs are one single input.
     */
    const isSingle = () => {
        return alwan.config.singleInput || formats[currentFormatIndex] === HEX_FORMAT;
    };

    /**
     * Builds inputs.
     */
    const build = () => {
        // Initialize inputs map.
        inputsMap = {};
        // Create inputs container.
        removeElement(inputsContainer);
        inputsContainer = createElement('', INPUTS_CLASSNAME, container, {}, INSERT_BEFORE_FIRST_CHILD);

        // Each letter in the format variable represent a color channel,
        // For multiple inputs, each color channel has an input field.
        // e.g. for 'rgb' format fields array is [r, g, b] or [r, g, b, a] if opacity is true.
        const format = formats[currentFormatIndex];
        const fields = isSingle()
            ? [format]
            : (format + (alwan.config.opacity ? 'a' : '')).split('');

        fields.forEach(field => {
            /**
             * Create Input.
             *
             * <label>
             *     <input type="text" class="alwan__input">
             *     <span>${field}</span>
             * </label>
             */
            const labelElement = createElement('label', '', inputsContainer);
            inputsMap[field] = createElement(INPUT, INPUT_CLASSNAME, labelElement, { type: 'text' });
            createElement('span', '', labelElement, { html: field });
        });

        /**
        * Bind events.
        */
        addEvent(inputsContainer, INPUT, handleChange);
        addEvent(inputsContainer, CHANGE, handleChangeStop);
        // Select value on focus.
        addEvent(inputsContainer, FOCUS_IN, (e) => { e.target.select(); });
        // Close picker if enter pressed while focusing in inputs.
        addEvent(inputsContainer, KEY_DOWN, (e) => { e.key === 'Enter' && alwan.close() });
    }

    /**
     * Changes color format.
     */
    const changeFormat = () => {
        // Increment input format index, reset it if it reaches the end.
        // this index will point to the next format.
        currentFormatIndex = (currentFormatIndex + 1) % formats.length;
        alwan._color._setFormat(formats[currentFormatIndex]);
        build();
    }

    /**
     * Handles changes in inputs.
     *
     * @param {InputEvent} e - Event.
     */
    const handleChange = ({ target }) => {

        if (! isChanged) {
            alwan._color._saveState();
            isChanged = true;
        }

        let str = target.value;
        let color = {};

        if (! isSingle()) {
            // Copy inputs values into an object (rgb or hsl).
            objectIterator(inputsMap, (input, key) => {
                color[key] = float(input.value);
            });
            // Convert the object into string.
            str = stringify(color, formats[currentFormatIndex]);
        }

        if (alwan._color._set(str, true)) {
            alwan._events._dispatch(COLOR, target);
        }
    }

    /**
     * Handles when an input loses focus after its value was changed.
     *
     * @param {InputEvent} e - Event.
     */
    const handleChangeStop = e => {
        alwan._color._triggerChange(e.target);
        isChanged = false;
        alwan._color._update();
    }

    /**
     * Component API.
     */
    return {
        /**
         * Initialize Inputs.
         *
         * @param {object} param0 - Alwan options.
         * @param {object} instance - Alwan instance.
         */
        _init({ inputs, format }, instance) {
            alwan = instance || alwan;
            inputs = inputs || {};
            inputsMap = {};

            formats = COLOR_FORMATS;

            if (inputs !== true) {
                // Get only valid formats.
                formats = formats.filter((format) => inputs[format]);
            }

            const length = formats.length;

            // Validate format.
            if(! length) {
                formats = COLOR_FORMATS;
            }
            currentFormatIndex = max(formats.indexOf(format), 0);
            alwan._color._setFormat(formats[currentFormatIndex]);

            // Initialize element.
            container = removeElement(container);
            switchButton = removeElement(switchButton);

            if (length) {
                // Create container and insert it after the util-sliders container.
                container = createContainer(ref, INSERT_AFTER);
                build();

                if (length > 1) {
                    switchButton = createButton('', container, { html: switchInputsSVG });
                    addEvent(switchButton, CLICK, changeFormat);
                }
            }
        },

        /**
         * Updates Input(s) value(s).
         *
         * @param {Object} color - Alwan color state object.
         */
        _values(color) {
            if (! isChanged) {
                objectIterator(inputsMap, (input, key) => {
                    input.value = color[key];
                })
            }
        }
    }
}