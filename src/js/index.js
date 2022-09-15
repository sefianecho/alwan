
import { getElement } from "./utils/dom";
import { merge, objectIterator } from "./utils/object";
import { defaults } from "./defaults";
import { createComponents, initialize } from "./core";
import '../sass/talwin.scss';
import { Color } from "./core/color";
import { boundNumber, isString, setColorAndTriggerEvents } from "./utils/util";
import { HEX_FORMAT, HSL_FORMAT, HSV_FORMAT, RGB_FORMAT } from "./constants";
import { HSVToHSL, HSVToRGB, RGBToHEX, toString } from "./lib/colors";
import { EventListener } from "./core/events/EventListener";
import { binder } from "./core/events/EventBinder";


export default class Alwan {

    static version = VERSION;

    /**
     * Alwan defaults.
     */
    static defaults = defaults;

    /**
     * Alwan instance constructor.
     *
     * @param {String|Element} reference - The reference element.
     * @param {Object} options - Options.
     */
    constructor(reference, options) {
        reference = getElement(reference);
        const alwan = this;
        alwan.config = merge({}, Alwan.defaults, options);
        alwan._e = EventListener(alwan);
        alwan._clr = Color(alwan);
        alwan._ui = createComponents(reference, alwan);
        initialize(alwan, alwan.config);
    }

    /**
     * Sets new options.
     *
     * @param {Object} options - Alwan options.
     */
    setOptions(options) {
        initialize(this, options);
    }

    /**
     * Gets the state of the picker whether it's opened or closed.
     *
     * @returns {Boolean}
     */
    isOpen() {
        return this._ui.app.isOpen();
    }

    /**
     * Opens the picker.
     */
    open() {
        this._ui.app.open();
    }

    /**
     * Closes the picker.
     */
    close() {
        this._ui.app.close();
    }

    /**
     * Toggles (opens/closes) the picker.
     */
    toggle() {
        this._ui.app.toggle();
    }

    /**
     * Attaches an event handler function for an event.
     *
     * @param {String} type - Event type.
     * @param {CallableFunction} handler - Event handler.
     */
    on(type, handler) {
        this._e.on(type, handler);
    }

    /**
     * Detaches one or more event handlers.
     *
     * Note:
     * omitting handler, remove all handlers from the event,
     * omitting both event type and handler, remove all handlers that are,
     * attached to all events.
     *
     * @param {String} type - Event type.
     * @param {CallableFunction} handler - Event handler.
     */
    off(type, handler) {
        this._e.off(type, handler);
    }

    /**
     * Sets a color.
     *
     * @param {String|Object} color - Color.
     */
    setColor(color) {

        let alwan = this;
        let format;

        if (! isString(color)) {
            // Get color format from color object.
            format = [RGB_FORMAT, HSL_FORMAT, HSV_FORMAT].find(format => format.split('')
                                                                                   .every(channel => color[channel] && ! isNaN(color[channel])));
            if (format) {
                let a = color.a;
                color.a = a != null ? a : 1;

                if (format === HSV_FORMAT) {
                    // Get current format.
                    format = alwan.config.format;

                    // H must be a value between 0 and 360.
                    color.h = (color.h % 360 + 360) % 360;
                    // S and V must be a value between 0 and 1.
                    color.s = boundNumber(color.s) / 100;
                    color.v = boundNumber(color.v) / 100;

                    // Convert HSV to the selected color format.
                    if (format === HSL_FORMAT) {
                        color = HSVToHSL(color);
                    } else {
                        color = HSVToRGB(color);

                        if (format === HEX_FORMAT) {
                            color = RGBToHEX(color);
                        }
                    }
                }
                color = toString(color, format);
            }
        }

        alwan._clr.updateByString(color, true);

        return alwan;
    }

    /**
     * Gets color.
     *
     * @returns {Object}
     */
    getColor() {
        return this._clr.value;
    }

    /**
     * Adds a swatch.
     *
     * @param {String} color - Color.
     */
    addSwatch(color) {
        this._ui.swatches.add(color);
    }

    /**
     * Removes a swatch.
     *
     * @param {String|Number} swatch - Can a color string or it's index in the swatches array.
     */
    removeSwatch(swatch) {
        this._ui.swatches.remove(swatch);
    }

    /**
     * Enables picker.
     */
    enable() {
        this._ui.app.disable(false);
    }

    /**
     * Disables picker.
     */
    disable() {
        this._ui.app.disable(true);
    }

    /**
     * Resets to default color.
     */
    reset() {
        setColorAndTriggerEvents(this, this.config.default);
    }

    /**
     * Repositions picker if it's displayed as a popover.
     */
    reposition() {
        this._ui.app.reposition();
    }

    /**
     * Executes all handlers attached to the specified event.
     *
     * @param {String} type - Event type.
     */
    trigger(type) {
        this._e.emit(type);
    }

    /**
     * Destroy picker and free up memory.
     */
    destroy() {

        let alwan = this;
        let components = alwan._ui;

        // Initialize the reference element back.
        components.ref.init({ preset: false, toggle: true });

        // Remove all events.
        objectIterator(components, components => {
            components.e.forEach(listener => {
                binder(listener, true);
            });
        });

        // Remove all properties of this instance.
        objectIterator(alwan, (value, key) => {
            alwan[key] = null;
        });
    }
}