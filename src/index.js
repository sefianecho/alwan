import { defaults } from "./defaults";
import { Reference } from "./reference";
import { merge, objectIterator, prototype, setPrototypeOf } from "./utils/object";
import { destroyComponents } from "./core/component";
import { color } from "./core/color";
import { Dispatcher } from "./core/events/dispatcher";
import { initialize } from "./core/init";
import "./assets/scss/alwan.scss";


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
        let alwan = this;

        alwan.config = merge({}, Alwan.defaults);
        alwan._events = Dispatcher(alwan);
        alwan._color = color(alwan);
        alwan._reference = Reference(reference, alwan);
        initialize(alwan, options);
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
        return this._reference._isOpen();
    }

    /**
     * Opens the picker.
     */
    open() {
        this._reference._open();
    }

    /**
     * Closes the picker.
     */
    close() {
        this._reference._close();
    }

    /**
     * Toggles (opens/closes) the picker.
     */
    toggle() {
        this._reference._toggle();
    }

    /**
     * Attaches an event handler function for an event.
     *
     * @param {String} type - Event type.
     * @param {CallableFunction} handler - Event handler.
     */
    on(type, handler) {
        this._events._addListener(type, handler);
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
        this._events._removeListeners(type, handler);
    }

    /**
     * Sets a color.
     *
     * @param {String|Object} color - Color.
     */
    setColor(color) {
        this._color._set(color);
        return this;
    }

    /**
     * Gets color.
     *
     * @returns {Object}
     */
    getColor() {
        return this._color._value();
    }

    /**
     * Adds a swatch.
     *
     * @param {String} color - Color.
     */
    addSwatch(color) {
        this._components._swatches._add(color);
    }

    /**
     * Removes a swatch.
     *
     * @param {String|Number} swatch - Can a color string or it's index in the swatches array.
     */
    removeSwatch(swatch) {
        this._components._swatches._remove(swatch);
    }

    /**
     * Enables picker.
     */
    enable() {
        this._reference._toggleDisable(false);
    }

    /**
     * Disables picker.
     */
    disable() {
        this._reference._toggleDisable(true);
    }

    /**
     * Resets to default color.
     */
    reset() {
        this._color._set(this.config.default);
    }

    /**
     * Repositions picker if it's displayed as a popover.
     */
    reposition() {
        this._components._app._reposition();
    }

    /**
     * Executes all handlers attached to the specified event.
     *
     * @param {String} type - Event type.
     */
    trigger(type) {
        this._events._dispatch(type);
    }

    /**
     * Destroy picker and free up memory.
     */
    destroy() {
        let alwan = this;

        alwan._reference._destroy();
        destroyComponents(alwan._components);

        // Remove all properties of this instance.
        objectIterator(alwan, (value, key) => {
            delete alwan[key];
        });

        // Empty instance prototype.
        setPrototypeOf(alwan, prototype);
    }
}