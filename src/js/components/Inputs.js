import { BUTTON, BUTTON_CLASSNAME, CHANGE, CLICK, COLOR, COLOR_FORMATS, ENTER, FOCUS_IN, HEX_FORMAT, INPUT, KEY_DOWN, max, SVG } from "../constants";
import { bindEvent } from "../core/events/EventBinder";
import { switchSVGAttrs } from "../lib/svg";
import { createElement, removeElement, setElementsHTML, setVisibility } from "../utils/dom";
import { objectIterator } from "../utils/object";

/**
 * Inputs constants.
 */
const INPUTS_CLASSNAME = 'talwin__inputs';
const INPUT_CLASSNAME = 'talwin__input';
const LABEL_CLASSNAME = 'tw-label';

/**
 * Inputs component.
 *
 * @param {Element} parent - Element to append the inputs container element to.
 * @param {Object} talwin - Talwin instance.
 * @returns {Object}
 */
export const Inputs = (parent, talwin) => {

    /**
     * Component API.
     */
    const self = {};

    /**
     * Inputs wrapper element.
     */
    let container;

    /**
     * Switch button.
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
     * Array of inputs.
     */
    let inputList;

    /**
     * Event listeners.
     */
    let listeners = [];

    const { config, _clr: colorState, _e: { emit } } = talwin;

    /**
     * Init. Inputs.
     *
     * @param {Object} options - Options.
     */
    self.init = (options) => {
        let { inputs, format } = options;
        let length;

        // Get only valid formats.
        formats = COLOR_FORMATS.filter(format => inputs[format]);
        length = formats.length;

        
        if (! length) {
            // No input, remove inputs.
            container = removeElement(container, true);
            switchButton = removeElement(switchButton, true);
            // Normalize format value.
            format = COLOR_FORMATS.includes(format) ? format : COLOR_FORMATS[0];
        } else {

            if (! container) {
                container = createElement('', INPUTS_CLASSNAME, parent);
            }

            if (length === 1) {
                switchButton = removeElement(switchButton, true);
            } else if (!switchButton) {
                // For more than one input format, add a switch button.
                switchButton = createElement(BUTTON, BUTTON_CLASSNAME, parent, { type: BUTTON }, (thisButton) => {
                    createElement(SVG, '', thisButton, switchSVGAttrs);
                });
            }

            formatIndex = max(formats.indexOf(format), 0);
            format = formats[formatIndex];
        }

        config.format = format;
        build(format);
        // Show/Hide parent container.
        setVisibility(parent, length);
    }

    /**
     * Build Inputs.
     */
    const build = (format) => {

        self.$ = {};
        inputList = [];

        if (container) {
            let { singleInput, opacity } = config;
            // Each letter in the format variable represent a color channel,
            // For multiple inputs, each color channel has an input field.
            // e.g. for 'rgb' format fields array is [r, g, b] or [r, g, b, a] if opacity is true.
            let fields = singleInput || format == HEX_FORMAT ? [format]
                        : (format + (opacity ? 'a' : '')).split('');

            // Empty the container from any inputs.
            setElementsHTML(container);

            fields.forEach((field, index) => {
                /**
                 * Create Input.
                 * 
                 * <label class="sc-label">
                 *     <input type="text" class="sc-picker__input">
                 *     <span>${field}</span>
                 * </label>
                 */
                createElement('label', LABEL_CLASSNAME, container, false, (label => {
                    self.$[field] = inputList[index] = createElement(INPUT, INPUT_CLASSNAME, label, { type: 'text' });
                    createElement('span', '', label, { text: field });
                }));
            });

            colorState.update({});
        }
    }

    /**
     * Handles changes in inputs.
     *
     * @param {Event} e - Input event.
     */
    const handleChange = e => {
        let value = e.target.value;

        if (value.trim()) {
            let colorString = '';
            let format = formats[formatIndex];
            
            if (config.singleInput || format === HEX_FORMAT) {
                colorString = value;
            } else {
                // InputList has 3 or 4 inputs, Input for each color channel in the hsl and rgb,
                // format, the reduce method adds comma between each input value.
                // [30, 20, 10, 0.5] => '30,20,10,0.5'
                colorString = format + '(' + inputList.reduce((string, currentInput) => (string && string + ',') + currentInput.value, '') + ')';
            }

            if (colorState.updateByString(colorString, self)) {
                emit(COLOR, self.$);
            }
        }
    }

    /**
     * Changes color format.
     *
     * @param {Event} e - Click event.
     */
    const changeFormat = e => {
        if (e.target === switchButton) {
            // Increment input format index, reset it if it reaches the end.
            // this index will point to the next format.
            formatIndex = (formatIndex + 1) % formats.length;
            config.format = formats[formatIndex];
            build(formats[formatIndex]);
        }
    }

    /**
     * Triggers change event when the color changes.
     *
     * @param {Event} e - Focusin or Change.
     */
    const triggerChangeEvent = e => {
        if (e.type === FOCUS_IN) {
            // Save color state, when inputs receive focus.
            colorState.start();
        } else {
            // Trigger change event if color state is changed.
            colorState.end(self.$);
        }
    }

    /**
     * Closes picker.
     *
     * @param {Event} e - Keydown.
     */
    const closePicker = e => {
        if (e.key === ENTER) {
            talwin.close();
        }
    }

    /**
     * Updates Input(s) value(s).
     *
     * @param {Object} color - Color object.
     */
    self.val = color => {
        objectIterator(self.$, (input, key) => {
            input.value = color[key];
        });
    }

    /**
     * Bind events.
     */
    bindEvent(listeners, parent, CLICK, changeFormat);
    bindEvent(listeners, parent, INPUT, handleChange);
    bindEvent(listeners, parent, [FOCUS_IN, CHANGE], triggerChangeEvent);
    bindEvent(listeners, parent, KEY_DOWN, closePicker);

    self.e = listeners;

    return self;
}