import { CLICK, COLOR_FORMATS, HEX_FORMAT, max } from "../constants";
import { bindEvent } from "../core/events/EventBinder";
import { switchSVGAttrs } from "../lib/svg";
import { createElement, removeElement } from "../utils/dom";

const INPUTS_CLASSNAME = 'talwin__inputs';
const INPUT_CLASSNAME = 'talwin__input';
const LABEL_CLASSNAME = 'tw-label';


export const Inputs = (parent, talwin) => {
    const self = {};
    const { config } = talwin;
    let container;
    let switchButton;
    let formats = [];
    let formatIndex;
    let listeners = [];

    /**
     * Init. Inputs.
     *
     * @param {Object} options - Options.
     */
    self.init = (options) => {
        let { inputs, format } = options;
        let length;

        formats = COLOR_FORMATS.filter(format => inputs[format]);
        length = formats.length;
        formatIndex = 0;

        if (! length) {
            container = removeElement(container, true);
            switchButton = removeElement(switchButton, true);
            formats = COLOR_FORMATS;
        } else {

            if (! container) {
                container = createElement('', INPUTS_CLASSNAME, parent);
            }

            if (length === 1) {
                switchButton = removeElement(switchButton, true);
            } else if (!switchButton) {
                switchButton = createElement('button', 'tw-btn', parent, { type: 'button' }, (thisButton) => {
                    createElement('svg', '', thisButton, switchSVGAttrs);
                });
            }

            formatIndex = max(formats.indexOf(format), 0);
            build();
        }

        config.format = formats.includes(format) ? format : formats[formatIndex];
        parent.style.display = length ? '' : 'none';
    }

    /**
     * Build Inputs.
     */
    const build = () => {
        if (container) {
            let inputList = [];
            let { singleInput, opacity, format } = config;
            let fields = singleInput || format == HEX_FORMAT ? [format]
                        : (format + (opacity ? 'a' : '')).split('');


            container.innerHTML = '';

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
                    inputList[index] = createElement('input', INPUT_CLASSNAME, label, { type: 'text' });
                    createElement('span', '', label, { text: field });
                }));
            });

            self.el = inputList;
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
            build();
        }
    }

    bindEvent(listeners, parent, CLICK, changeFormat);

    return self;
}