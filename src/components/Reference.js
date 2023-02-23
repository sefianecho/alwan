import { BUTTON, CLICK } from "../constants";
import { bindEvent, unbindEvent } from "../core/events/EventBinder";
import { createElement, replaceElement, setVisibility, updateClass } from "../utils/dom";


const PRESET_BUTTON_CLASSNAME = 'lw-ref';

/**
 * Creates a Reference component.
 *
 * @param {Element} originalRef - User Reference Element.
 * @returns {Object}
 */
export const Reference = (originalRef, alwan) => {

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
        _init(options) {
            let { preset, classname } = options;
            let { $: ref, e: events } = self;

            events = unbindEvent(events, ref);
            
            if (preset !== (ref !== originalRef)) {
                ref = preset ?
                        // Replace the user provided reference element with a preset button.
                        replaceElement( createElement(BUTTON, PRESET_BUTTON_CLASSNAME, null, { type: BUTTON, id: originalRef.id }), originalRef)
                        // Set back user reference element.
                        : replaceElement(originalRef, ref);
            }

            // Add classes in the reference element.
            if (classname) {
                classname.split(/\s+/).map(cls => { updateClass(ref, cls, true) });
            }

            // Add click event to reference.
            bindEvent(events, ref, CLICK, togglePicker);
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
        alwan.toggle();
    }

    return self;
}