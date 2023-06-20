import { Reference } from "./components/reference";
import { merge, objectIterator, prototype, setPrototypeOf } from "./utils/object";
import { destroyComponents, isShared, useComponents } from "./core/component";
import { color } from "./core/color";
import { Dispatcher } from "./core/events/dispatcher";
import "./assets/scss/alwan.scss";
import { defaults } from "./constants/defaults";
import { isset } from "./utils/util.js";
import { getElement } from "./utils/dom";


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
        alwan._reference = Reference(getElement(reference), alwan);
        alwan.setOptions(options);
    }

    /**
     * Sets new options.
     *
     * @param {Object} options - Alwan options.
     */
    setOptions(options) {
        options = options || {};

        let alwan = this;
        let config = merge(alwan.config, options);
        let { color, disabled } = options;
        let core = alwan._color;
        let app;

        alwan._components = useComponents(alwan);
        alwan._reference._init(config);
        app = alwan._components._app;

        if (isShared(alwan._components)) {
            app._toggle(null, false);
        }

        app._setup(config, alwan);
        alwan._reference._setDisabled(disabled);

        if (isset(color)) {
            core._set(color);
        }

        // To update inputs values.
        core._update();
    }

    /**
     * Gets the state of the picker whether it's opened or closed.
     *
     * @returns {Boolean}
     */
    isOpen() {
        return this._components._app._isOpen();
    }

    /**
     * Opens the picker.
     */
    open() {
        this._components._app._toggle(this, true);
    }

    /**
     * Closes the picker.
     */
    close() {
        this._components._app._toggle(this, false);
    }

    /**
     * Toggles (opens/closes) the picker.
     */
    toggle() {
        this._components._app._toggle(this);
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
     * Adds color swatches.
     *
     * @param {Array<string | object>} swatches - Color swatches.
     */
    addSwatches(...swatches) {
        this._components._swatches._add(swatches);
    }

    /**
     * Removes color swatches.
     *
     * @param {Array<string | number | object} swatches - Array of swatches or their indexes in the config.swatches array.
     */
    removeSwatches(...swatches) {
        this._components._swatches._remove(swatches);
    }

    /**
     * Enables picker.
     */
    enable() {
        this._reference._setDisabled(false);
    }

    /**
     * Disables picker.
     */
    disable() {
        this._reference._setDisabled(true);
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
        objectIterator(alwan, (_, key) => {
            delete alwan[key];
        });

        // Empty instance prototype.
        setPrototypeOf(alwan, prototype);
    }
}