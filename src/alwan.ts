import { version } from '../package.json';
import { alwanDefaults } from './constants/defaults';
import { createApp } from './core/app';
import { colorState } from './core/colorState';
import { Emitter } from './core/events/emitter';
import type { EventEmitter, IColorState, alwanApp, alwanConfig, alwanOptions } from './types';
import { getElement } from './utils/dom';
import { deepMerge } from './utils/object';

/**
 * Alwan color picker.
 */
export class Alwan {
    /**
     * @returns The latest version.
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
    constructor(reference: string, options?: alwanOptions) {
        this.config = deepMerge({}, alwanDefaults);
        this._events = Emitter(this);
        this._color = colorState(this);
        this._app = createApp(this, getElement(reference))._setup(options);
    }
}
