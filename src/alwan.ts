import { version } from "../package.json";
import "./assets/scss/alwan.scss";
import { alwanDefaults } from "./defaults";
import { controller } from "./core/controller";
import { colorState } from "./core/state";
import { eventEmitter } from "./core/eventEmitter";
import type {
    Color,
    EventEmitter,
    IColorState,
    IController,
    alwanConfig,
    alwanEventHandler,
    alwanEventType,
    alwanOptions,
    alwanValue,
} from "./types";
import { getElements } from "./utils/dom";
import { isNumber } from "./utils";
import {
    ObjectForEach,
    deepMerge,
    prototype,
    setPrototypeOf,
} from "./utils/object";

export class Alwan {
    static version() {
        return version;
    }

    static setDefaults(defaults: alwanOptions) {
        deepMerge(alwanDefaults, defaults);
    }

    config: alwanConfig;
    e: EventEmitter;
    s: IColorState;
    c: IController;
    constructor(reference: string | Element, options?: alwanOptions) {
        this.config = deepMerge({}, alwanDefaults);
        this.e = eventEmitter(this);
        this.s = colorState(this);
        this.c = controller(this, getElements(reference)[0]);
        this.c._setup(options || {});
    }

    setOptions(options: alwanOptions) {
        options && this.c._setup(options);
    }

    setColor(color: Color) {
        this.s._parse(color);
        return this;
    }

    getColor(): alwanValue {
        return { ...this.s._value };
    }

    isOpen() {
        return this.c._isOpen();
    }

    open() {
        this.c._toggle(true);
    }

    close() {
        this.c._toggle(false);
    }

    toggle() {
        this.c._toggle();
    }

    on(type: alwanEventType, listener: alwanEventHandler) {
        this.e._on(type, listener);
    }

    off(type?: alwanEventType, listener?: alwanEventHandler) {
        this.e._off(type, listener);
    }

    addSwatches(...swatches: Color[]) {
        this.c._setup({ swatches: this.config.swatches.concat(swatches) });
    }

    removeSwatches(...swatches: Array<number | Color>) {
        this.c._setup({
            swatches: this.config.swatches.filter(
                (swatch, index) =>
                    !swatches.some((item) =>
                        isNumber(item) ? +item === index : item === swatch,
                    ),
            ),
        });
    }

    enable() {
        this.c._setup({ disabled: false });
    }

    disable() {
        this.c._setup({ disabled: true });
    }

    reset() {
        this.s._parse(this.config.default);
    }

    reposition() {
        this.c._reposition();
    }

    trigger(type: alwanEventType) {
        this.e._emit(type);
    }

    destroy() {
        this.c._destroy();
        ObjectForEach(this, (key) => {
            (this[key] as null) = null;
        });
        setPrototypeOf(this, prototype);
    }
}
