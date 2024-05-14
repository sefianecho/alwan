import { version } from "../package.json";
import "./assets/scss/alwan.scss";
import { alwanDefaults } from "./constants/defaults";
import { createApp } from "./core/app";
import { colorState } from "./core/colorState";
import { Emitter } from "./core/events/emitter";
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
} from "./types";
import { isNumber } from "./utils/is";
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

	setOptions(options: alwanOptions) {
		this._app._setup(options);
	}

	setColor(color: Color) {
		this._color._setColor(color);
		return this;
	}

	getColor(): alwanValue {
		return { ...this._color._value };
	}

	isOpen() {
		return this._app._isOpen();
	}

	open() {
		this._app._toggle(true);
	}

	close() {
		this._app._toggle(false);
	}

	toggle() {
		this._app._toggle();
	}

	on(type: alwanEventType, listener: alwanEventListener) {
		this._events._on(type, listener);
	}

	off(type?: alwanEventType, listener?: alwanEventListener) {
		this._events._off(type, listener);
	}

	addSwatches(...swatches: Color[]) {
		this._app._setup({ swatches: this.config.swatches.concat(swatches) });
	}

	removeSwatches(...swatches: Array<number | Color>) {
		this._app._setup({
			swatches: this.config.swatches.filter(
				(swatch, index) =>
					!swatches.some((item) =>
						isNumber(item) ? +item === index : item === swatch,
					),
			),
		});
	}

	enable() {
		this._app._setup({ disabled: false });
	}

	disable() {
		this._app._setup({ disabled: true });
	}

	reset() {
		this._color._setColor(this.config.default);
	}

	reposition() {
		this._app._reposition();
	}

	trigger(type: alwanEventType) {
		this._events._emit(type);
	}

	destroy() {
		this._app._destroy();
		ObjectForEach(this, (key) => delete this[key]);
		setPrototypeOf(this, prototype);
	}
}
