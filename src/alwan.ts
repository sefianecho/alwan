import { version } from '../package.json';
import { alwanDefaults } from './constants/defaults';
import type { alwanOptions } from './types';
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
}
