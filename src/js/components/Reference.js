import { BUTTON, CLICK } from "../constants";
import { bindEvent, unbindEvent } from "../core/events/EventBinder";
import { createElement, replaceElement, setVisibility } from "../utils/dom";


const PRESET_BUTTON_CLASSNAME = 'tw-ref';

/**
 * Creates a Reference component.
 *
 * @param {Element} originalRef - User Reference Element.
 * @returns {Object}
 */
export const Reference = (originalRef, talwin) => {

    /**
     * Reference API.
     */
    const self = {
        $: originalRef,
        /**
         * Reference Events.
         */
        e: [],
        /**
         * Sets/Unsets the pre-styled button.
         *
         * @param {Object} options - Picker options.
         */
        init(options) {
            let { preset, toggle, classname } = options;
            let { $: ref, e: events } = self;

            events = unbindEvent(events, ref);
            
            if (preset !== (ref !== originalRef)) {
                ref = preset ?
                        // Replace the user provided reference element with a preset button.
                        replaceElement( createElement(BUTTON, PRESET_BUTTON_CLASSNAME, null, { type: BUTTON, id: originalRef.id }), originalRef)
                        // Set back user reference element.
                        : replaceElement(originalRef, ref);
            }

            // Set classname to the reference.
            if (classname) {
                ref.className = PRESET_BUTTON_CLASSNAME + ' ' + classname;
            }

            if (toggle) {
                bindEvent(events, ref, CLICK, togglePicker);
            }

            setVisibility(ref, toggle);
            self.$ = ref;
            self.e = events;
        }
    }

    /**
     * Toggle picker.
     *
     * @param {Event} e - Click.
     */
    const togglePicker = e => {
        talwin.toggle();
    }

    return self;
}