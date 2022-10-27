
import { getElement } from "./utils/dom";
import { merge, objectIterator } from "./utils/object";
import { defaults } from "./defaults";
import { createComponents } from "./core";
import { ColorState } from "./core/colorState";
import { boundNumber, isString, normalizeHue, setColorAndTriggerEvents } from "./utils/util";
import { HEX_FORMAT, HSL_FORMAT, HSV_FORMAT, RGB_FORMAT } from "./constants";
import { HSVToHSL, HSVToRGB, RGBToHEX, toString } from "./lib/colors";
import { EventListener } from "./core/events/EventListener";
import { binder } from "./core/events/EventBinder";
import '../sass/alwan.scss';


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

        const alwan = this;

        reference = getElement(reference);

        /**
         * Settings.
         */
        alwan.config = merge({}, Alwan.defaults, options);

        /**
         * Event Listeners.
         */
        alwan._e = EventListener(alwan);

        /**
         * Color state.
         */
        alwan._s = ColorState(alwan);

        /**
         * Components.
         */
        alwan._c = createComponents(reference, alwan);

        /**
         * Initialize components.
         */
        alwan._c.app._setup(alwan.config);
    }

    /**
     * Sets new options.
     *
     * @param {Object} options - Alwan options.
     */
    setOptions(options) {
        this._c.app._setup(options);
    }

    /**
     * Gets the state of the picker whether it's opened or closed.
     *
     * @returns {Boolean}
     */
    isOpen() {
        return this._c.app._isOpen();
    }

    /**
     * Opens the picker.
     */
    open() {
        this._c.app._open();
    }

    /**
     * Closes the picker.
     */
    close() {
        this._c.app._close();
    }

    /**
     * Toggles (opens/closes) the picker.
     */
    toggle() {
        this._c.app._toggle();
    }

    /**
     * Attaches an event handler function for an event.
     *
     * @param {String} type - Event type.
     * @param {CallableFunction} handler - Event handler.
     */
    on(type, handler) {
        this._e._on(type, handler);
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
        this._e._off(type, handler);
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
                                                                               .every(channel => ! isNaN(color[channel]) && color[channel] !== ''));
            if (format) {
                if (color.a == null) {
                    color.a = 1;
                }

                if (format === HSV_FORMAT) {
                    alwan._s._update({
                        h: normalizeHue(color.h),
                        s: boundNumber(color.s) / 100,
                        v: boundNumber(color.v) / 100,
                        a: color.a
                    }, true);
                } else {
                    color = toString(color, format);
                }
            }
        }

        alwan._s._updateFromString(color, true);

        return alwan;
    }

    /**
     * Gets color.
     *
     * @returns {Object}
     */
    getColor() {
        return this._s._colorOutput;
    }

    /**
     * Adds a swatch.
     *
     * @param {String} color - Color.
     */
    addSwatch(color) {
        this._c.swatches._add(color);
    }

    /**
     * Removes a swatch.
     *
     * @param {String|Number} swatch - Can a color string or it's index in the swatches array.
     */
    removeSwatch(swatch) {
        this._c.swatches._remove(swatch);
    }

    /**
     * Enables picker.
     */
    enable() {
        this._c.app._setDisable(false);
    }

    /**
     * Disables picker.
     */
    disable() {
        this._c.app._setDisable(true);
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
        this._c.app._reposition();
    }

    /**
     * Executes all handlers attached to the specified event.
     *
     * @param {String} type - Event type.
     */
    trigger(type) {
        this._e._emit(type);
    }

    /**
     * Destroy picker and free up memory.
     */
    destroy() {

        let alwan = this;
        let components = alwan._c;

        // Initialize the reference element back.
        components.ref._init({ preset: false });

        // Remove all events.
        objectIterator(components, components => {
            components.e.forEach(listener => {
                binder(listener, true);
            });
        });

        // Remove all properties of this instance.
        objectIterator(alwan, (value, key) => {
            delete alwan[key];
        });
    }
}