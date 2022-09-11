
import { getElement } from "./utils/dom";
import { merge } from "./utils/object";
import { defaults } from "./defaults";
import { createComponents, initialize } from "./core";
import '../sass/talwin.scss';
import { Color } from "./core/color";
import { boundNumber, isString } from "./utils/util";
import { HEX_FORMAT, HSL_FORMAT, HSV_FORMAT, RGB_FORMAT } from "./constants";
import { HSVToHSL, HSVToRGB, RGBToHEX, toString } from "./lib/colors";
import { EventListener } from "./core/events/EventListener";

export default class Talwin {

    static defaults = defaults;

    constructor(reference, options) {
        reference = getElement(reference);
        const talwin = this;
        talwin.config = merge({}, Talwin.defaults, options);
        talwin._e = EventListener(talwin);
        talwin._clr = Color(talwin);
        talwin._ui = createComponents(reference, talwin);
        initialize(talwin);
    }

    setOptions(options) {
        initialize(this, options);
    }

    isOpen() {
        return this._ui.app.isOpen();
    }

    open() {
        this._ui.app.open();
    }

    close() {
        this._ui.app.close();
    }

    toggle() {
        this._ui.app.toggle();
    }

    on(type, handler) {
        this._e.on(type, handler);
    }

    off(type, handler) {
        this._e.off(type, handler);
    }

    /**
     * Sets a color.
     *
     * @param {String|Object} color - Color.
     */
    setColor(color) {

        if (! isString(color)) {
            // Get color format from color object.
            let format = [RGB_FORMAT, HSL_FORMAT, HSV_FORMAT].find(format => format.split('')
                                                                                   .every(channel => color[channel] && ! isNaN(color[channel])));
            if (format) {
                let a = color.a;
                color.a = a != null ? a : 1;

                if (format === HSV_FORMAT) {
                    // Get current format.
                    format = this.config.format;

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

        this._clr.updateByString(color, true);
    }

    getColor() {
        return this._clr.value;
    }

    addSwatch(color) {
        this._ui.swatches.add(color);
    }

    removeSwatch(swatch) {
        this._ui.swatches.remove(swatch);
    }

    enable() {
        this._ui.app.disable(false);
    }

    disable() {
        this._ui.app.disable(true);
    }
}