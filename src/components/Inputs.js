import { switchInputsSVG } from "../assets/svg";
import { BUTTON_CLASSNAME, INPUTS_CLASSNAME, INPUT_CLASSNAME } from "../classnames";
import { stringify } from "../colors/stringify";
import { CLICK, COLOR_FORMATS, ENTER, HEX_FORMAT, INPUT, KEY_DOWN} from "../constants";
import { createButton, createElement, removeElement, setHTML, toggleVisibility } from "../utils/dom";
import { max } from "../utils/number";
import { objectIterator } from "../utils/object";
import { isString } from "../utils/string";


/**
 * Creates Inputs component.
 *
 * @param {Element} parent - Element to append the inputs container element to.
 * @param {Object} alwan - Alwan instance.
 * @returns {Object} - Inputs component.
 */
export const Inputs = (parent, alwan, events) => {

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
            
            // Get only valid formats.
            formats = COLOR_FORMATS.filter(format => inputs[format]);
            let length = formats.length;

            if (! length) {
                // No inputs, remove inputs container and the switch button.
                inputsContainer = removeElement(inputsContainer);
                switchButton = removeElement(switchButton);
                // Normalize format value.
                format = COLOR_FORMATS.includes(format) ? format : COLOR_FORMATS[0];
            } else {

                // Create inputs container.
                if (! inputsContainer) {
                    inputsContainer = createElement('', INPUTS_CLASSNAME, parent);
                }

                if (length === 1) {
                    switchButton = removeElement(switchButton);
                } else if (!switchButton) {
                    // For more than one input format, add a switch button.
                    switchButton = createButton(BUTTON_CLASSNAME, parent, { _content: switchInputsSVG });
                }

                // Validate and normalize format value.
                formatIndex = max(formats.indexOf(format), 0);
                format = formats[formatIndex];
                build(format);
            }

            alwan.config.format = format;
            // Show/Hide parent container.
            toggleVisibility(parent, length);
        },

        /**
         * Updates Input(s) value(s).
         *
         * @param {Object} color - Color object.
         */
        _setValue(color) {
            objectIterator(inputsMap, (input, key) => {
                input.value = isString(color) ? color : color[key];
            });
        }
    }

    /**
     * Builds inputs.
     *
     * @param {string} format - Color format.
     */
    const build = (format) => {
        let { singleInput, opacity } = alwan.config;
        let fields;
        // Each letter in the format variable represent a color channel,
        // For multiple inputs, each color channel has an input field.
        // e.g. for 'rgb' format fields array is [r, g, b] or [r, g, b, a] if opacity is true.
        if (singleInput || format === HEX_FORMAT) {
            fields = [format];
        } else {
            fields = (format + (opacity ? 'a' : '')).split('');
        }

        // Empty the container from any inputs.
        setHTML(inputsContainer, '');
        inputsMap = {};

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
            inputsMap[field] = createElement(INPUT, INPUT_CLASSNAME, labelElement);
            createElement('span', '', labelElement, { _content: field });
        });
    }

    /**
     * Handles changes in inputs.
     *
     * @param {InputEvent} e - Event.
     */
    const handleChange = ({ target: { value }}) => {
        let str = '';
        let color = {};
        let format = formats[formatIndex];

        if (alwan.config.singleInput || format === HEX_FORMAT) {
            str = value;
        } else {
            // Copy inputs values into an object (rgb or hsl).
            objectIterator(inputsMap, (input, key) => {
                color[key] = input.value;
            });
            // Convert the object into string.
            str = stringify(color, format);
        }
        if (alwan._color._set(str, true)) {
            // dispatch event.
        }
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
            alwan.config.format = formats[formatIndex];
            build(formats[formatIndex]);
            alwan._color._update();
        }
    }

    /**
     * Closes picker.
     *
     * @param {KeyboardEvent} e - Event.
     */
    const closePicker = e => {
        if (e.key === ENTER) {
            alwan._reference._close();
        }
    }

    /**
     * Bind events.
     */
    events._bind(parent, CLICK, changeFormat);
    events._bind(parent, INPUT, handleChange);
    events._bind(parent, KEY_DOWN, closePicker);


    return self;
}