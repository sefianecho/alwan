import { switchInputsSVG } from "../assets/svg";
import { INPUTS_CLASSNAME, INPUT_CLASSNAME } from "../constants/classnames";
import { stringify } from "../colors/stringify";
import { CHANGE, CLICK, COLOR, COLOR_FORMATS, ENTER, FOCUS_IN, HEX_FORMAT, INPUT, KEY_DOWN, RGB_FORMAT} from "../constants/globals";
import { createButton, createElement, removeElement, setHTML, toggleVisibility } from "../utils/dom";
import { float, max } from "../utils/number";
import { objectIterator } from "../utils/object";


/**
 * Creates Inputs component.
 *
 * @param {Element} container - Element to append the inputs container element to.
 * @param {Object} alwan - Alwan instance.
 * @returns {Object} - Inputs component.
 */
export const Inputs = (container, alwan, events) => {

    /**
     * Inputs wrapper element.
     */
    let inputsContainer;

    /**
     * Switch button.
     *
     * @type {Element}
     */
    let switchButton;

    /**
     * Picker formats.
     */
    let formats = [];

    /**
     * Index of the current format.
     */
    let formatIndex;

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
     * Component API.
     */
    const self = {
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

            // Get only valid formats.
            formats = COLOR_FORMATS.filter(format => inputs[format]);
            let length = formats.length;

            if (! length) {
                // No inputs, remove inputs container and the switch button.
                inputsContainer = removeElement(inputsContainer);
                switchButton = removeElement(switchButton);

                formats = COLOR_FORMATS;
            } else {

                // Create inputs container.
                if (! inputsContainer) {
                    inputsContainer = createElement('', INPUTS_CLASSNAME, container);
                }

                if (length > 1) {
                    if (!switchButton) {
                        // For more than one input format, add a switch button.
                        switchButton = createButton('', container, { html: switchInputsSVG });
                    }
                } else {
                    switchButton = removeElement(switchButton);
                }
            }

            // Validate and normalize format value.
            formatIndex = max(formats.indexOf(format), 0);
            format = formats[formatIndex];
            build(format);

            // Show/Hide parent container.
            toggleVisibility(container, length);
        },

        /**
         * Updates Input(s) value(s).
         *
         * @param {Object} color - Color object.
         */
        _update(color) {
            objectIterator(inputsMap, (input, key) => {
                input.value = color[key];
            })
        }
    }

    /**
     * Builds inputs.
     *
     * @param {string} format - Color format.
     */
    const build = (format) => {

        alwan._color._setFormat(format);

        if (inputsContainer) {
            let { singleInput, opacity } = alwan.config;
            let fields;
            let props;
            // Each letter in the format variable represent a color channel,
            // For multiple inputs, each color channel has an input field.
            // e.g. for 'rgb' format fields array is [r, g, b] or [r, g, b, a] if opacity is true.
            if (singleInput || format === HEX_FORMAT) {
                fields = [format];

                props = {
                    type: 'text',
                }
            } else {
                fields = (format + (opacity ? 'a' : '')).split('');

                props = {
                    type: 'number',
                    max: format === RGB_FORMAT ? 255 : 100,
                    min: '0'
                }
            }

            // Empty the container from any inputs.
            setHTML(inputsContainer, '');

            fields.forEach(field => {
                /**
                 * Create Input.
                 *
                 * <label>
                 *     <input type="text|number" class="alwan__input">
                 *     <span>${field}</span>
                 * </label>
                 */
                const labelElement = createElement('label', '', inputsContainer);
                inputsMap[field] = createElement(INPUT, INPUT_CLASSNAME, labelElement, props);
                createElement('span', '', labelElement, { html: field });
            });
        }
    }

    /**
     * Handles changes in inputs.
     *
     * @param {InputEvent} e - Event.
     */
    const handleChange = ({ target: { value }}) => {

        if (! isChanged) {
            alwan._color._saveState();
            isChanged = true;
        }

        let str = '';
        let color = {};
        let format = formats[formatIndex];

        if (alwan.config.singleInput || format === HEX_FORMAT) {
            str = value;
        } else {
            // Copy inputs values into an object (rgb or hsl).
            objectIterator(inputsMap, (input, key) => {
                color[key] = float(input.value);
            });
            // Convert the object into string.
            str = stringify(color, format);
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
     * Changes color format.
     *
     * @param {MouseEvent} e - Click event.
     */
    const changeFormat = e => {
        if (e.target === switchButton) {
            // Increment input format index, reset it if it reaches the end.
            // this index will point to the next format.
            formatIndex = (formatIndex + 1) % formats.length;
            build(formats[formatIndex]);
            // Update values.
            alwan._color._update();
        }
    }

    /**
     * Select input value when focus in, and close the picker when pressing Enter key.
     *
     * @param {FocusEvent|KeyboardEvent} e - Event.
     */
    const selectOrClose = ({ target, key, type }) => {
        if (target !== switchButton) {
            if (type === FOCUS_IN) {
                target.select();
            } else if (key === ENTER) {
                alwan.close();
            }
        }
    }

    /**
     * Bind events.
     */
    events._bind(container, CLICK, changeFormat);
    events._bind(container, INPUT, handleChange);
    events._bind(container, CHANGE, handleChangeStop);
    events._bind(container, [KEY_DOWN, FOCUS_IN], selectOrClose);


    return self;
}