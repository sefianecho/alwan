import { ALL, ALPHA, ALPHA_SLIDER, INPUTS, PALETTE, RGB_FORMAT } from "../constants";
import { HSVToRGB, toString } from "../lib/colors";
import { setCustomProperty } from "../utils/dom";
import { merge } from "../utils/object";

/**
 * Color state.
 *
 * @param {Object} talwin - Talwin instance.
 * @returns {Object}
 */
export const Color = (talwin) => {

    let HSV = {
        h: 0,
        s: 0,
        v: 0,
        a: 1
    }

    let RGB;

    let rgbString = '';

    /**
     * Updates color and UI.
     *
     * @param {Object} newHSV - HSV color object.
     * @param {Number} from - A number indicates which component is updating the color.
     * @param {Object} rgb - RGB color object.
     */
    const update = (newHSV, from, rgb) => {

        merge(HSV, newHSV);
        RGB = rgb || HSVToRGB(HSV);
        rgbString = toString(RGB, RGB_FORMAT);

        let components = talwin._ui;
        let palette = components.palette;
        let sliders = components.sliders;

        // Preview color.
        setCustomProperty(components.preview.el, 'tw-color', rgbString);
        setCustomProperty(components.ref.$, 'tw-color', rgbString);

        if (from !== ALPHA_SLIDER) {
            // Change the gradient color stop of the alpha slider.
            setCustomProperty(sliders.alpha, 'rgb', RGB.r + ',' + RGB.g + ',' + RGB.b);
            
            if (from !== PALETTE) {
                // Set palette's hue.
                setCustomProperty(palette.$, 'hue', HSV.h);
            }
        }

        if (from !== INPUTS) {
            // components.inputs.update();
        }

        if (! from || from === INPUTS) {
            // sliders.val(HSV);
            // palette.update(HSV);
        }
    }

    return {
        update
    }
}