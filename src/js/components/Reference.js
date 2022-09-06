import { CLICK, KEY_DOWN, TAB } from "../constants";
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
     * Event Listeners.
     */
    let listeners = [];

    /**
     * Reference API.
     */
    const self = {
        $: originalRef,
        /**
         * Sets/Unsets the pre-styled button.
         *
         * @param {Object} options - Picker options.
         */
        init(options) {
            let { preset, toggle } = options;
            let ref = self.$;
            listeners = unbindEvent(listeners, ref);
            
            if (preset !== (ref !== originalRef)) {
                ref = preset ?
                        // Replace the user provided reference element with a preset button.
                        replaceElement( createElement('button', PRESET_BUTTON_CLASSNAME, null, { type: 'button' }), originalRef)
                        // Set back user reference element.
                        : replaceElement(originalRef, ref);
            }

            if (toggle) {
                bindEvent(listeners, ref, CLICK, togglePicker);
                bindEvent(listeners, ref, KEY_DOWN, handleFocus);
            }

            setVisibility(ref, toggle);
            self.$ = ref;
        }
    }

    /**
     * Handles focus, pressing tab send focus to the picker if it's open.
     *
     * @param {Event} e - Keydown.
     */
    const handleFocus = e => {
        let components = talwin._ui;

        if (components.app.isOpen() && e.key === TAB && ! e.shiftKey) {
            e.preventDefault();
            components.palette.$.focus();
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