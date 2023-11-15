import { version } from '../package.json';
import { alwanDefaults } from './constants/defaults';
import { createApp } from './core/app';
import { colorState } from './core/colorState';
import { Emitter } from './core/events/emitter';
import type {
    Color,
    EventEmitter,
    IColorState,
    alwanApp,
    alwanConfig,
    alwanEventListener,
    alwanEventType,
    alwanOptions,
    alwanValue,
} from './types';
import { isNumber } from './utils/is';
import { ObjectForEach, deepMerge, prototype, setPrototypeOf } from './utils/object';
import './assets/scss/alwan.scss';
/**
 * Alwan color picker.
 */
export class Alwan {
    /**
     * @returns package version.
     */
    static version() {
        return version;
    }
    /**
     * Modifies default options for all instances (before instantiation).
     * @param defaults - Options.
     */
    static setDefaults(defaults: alwanOptions) {
        deepMerge(alwanDefaults, defaults);
    }

    config: alwanConfig;
    _events: EventEmitter;
    _color: IColorState;
    _app: alwanApp;
    constructor(reference: string | Element, options?: alwanOptions) {
        this.config = deepMerge({}, alwanDefaults);
        this._events = Emitter(this);
        this._color = colorState(this);
        this._app = createApp(this, reference);
        this._app._setup(options);
    }

    /**
     * Sets new options.
     *
     * @param options - New options.
     */
    setOptions(options: alwanOptions) {
        this._app._setup(options);
    }

    /**
     * Sets a new color.
     *
     * @param color - Color.
     * @returns - Instance.
     */
    setColor(color: Color) {
        this._color._setColor(color);
        return this;
    }

    /**
     * @returns - Gets color details (value).
     */
    getColor(): alwanValue {
        return { ...this._color._value };
    }

    /**
     * @returns the state of the picker whether it's opened or closed.
     */
    isOpen() {
        return this._app._isOpen();
    }

    /**
     * Opens the color picker.
     */
    open() {
        this._app._toggle(true);
    }

    /**
     * Closes the color picker.
     */
    close() {
        this._app._toggle(false);
    }

    /**
     * Toggles (open/close) the color picker.
     */
    toggle() {
        this._app._toggle();
    }

    /**
     * Attaches an event listener.
     *
     * @param type - Event type.
     * @param listener - Event listener (handler).
     */
    on(type: alwanEventType, listener: alwanEventListener) {
        this._events._on(type, listener);
    }

    /**
     * Detaches one or more event handlers.
     *
     * Note:
     * omitting handler, remove all handlers from the event,
     * omitting both event type and handler, remove all handlers that are,
     * attached to all events.
     *
     * @param type - Event type.
     * @param listener - Event listener (handler).
     */
    off(type?: alwanEventType, listener?: alwanEventListener) {
        this._events._off(type, listener);
    }

    /**
     * Adds color swatches.
     *
     * @param swatches - Color swatches.
     */
    addSwatches(...swatches: Color[]) {
        this._app._setup({ swatches: this.config.swatches.concat(swatches) });
    }

    /**
     * Removes color swatches.
     *
     * @param swatches - Color swatches or color swatches indexes.
     */
    removeSwatches(...swatches: Array<number | Color>) {
        this._app._setup({
            swatches: this.config.swatches.filter(
                (swatch, index) =>
                    !swatches.some((item) => (isNumber(item) ? +item === index : item === swatch))
            ),
        });
    }

    /**
     * Enables the color picker.
     */
    enable() {
        this._app._setup({ disabled: false });
    }

    /**
     * Disables the color picker.
     */
    disable() {
        this._app._setup({ disabled: true });
    }

    /**
     * Resets to default color.
     */
    reset() {
        this._color._setColor(this.config.default);
    }

    /**
     * Repositions picker if it's displayed as a popover.
     */
    reposition() {
        this._app._reposition();
    }

    /**
     * Executes all handlers attached to the specified event.
     *
     * @param type - Event type.
     */
    trigger(type: alwanEventType) {
        this._events._emit(type);
    }

    /**
     * Destroy picker and free up memory.
     */
    destroy() {
        this._app._destroy();
        // Remove all properties of this instance.
        ObjectForEach(this, (key) => delete this[key]);
        // Empty instance prototype.
        setPrototypeOf(this, prototype);
    }
}
