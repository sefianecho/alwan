import { DEFAULT_COLOR } from "./globals";

/**
 * Alwan defaults.
 */
 export const defaults = {
    /**
     * Set the container's (widget) id.
     *
     * @type {string}
     */
    id: '',

    /**
     * Add classes (separated by a white space) to the preset button.
     *
     * @type {string}
     */
    classname: '',

    /**
     * Choose a theme.
     *
     * @type {'dark' | 'light'}
     */
    theme: 'light',

    /**
     * Toggle picker's visibility (Show/Hide), Setting this to false keeps the picker visible.
     *
     * @type {boolean}
     */
    toggle: true,

    /**
     * Display the picker container as a pop-up (a box that floats on top of the page content),
     * if it's false, picker container will be displayed as a block (embedded in the page's content).
     *
     * @type {boolean}
     */
    popover: true,

    /**
     * Set the position of the popper (if popover is set to true) relative to the reference element,
     * the position has two values separated by a dash (-),
     * the first value is the direction (top, bottom, right, left),
     * the second value is the alignment (start, center, end), omitting this value will default to center.
     * e.g. 'bottom-start': 'bottom' places the picker below the reference element,
     * and 'start' aligns the left side of the container with the left side of the reference element.
     * Note:
     * If the picker container has no space to be placed, it will auto-position itself.
     * based on the available space.
     *
     * @type {string}
     */
    position: 'bottom-start',

    /**
     * Set the gap (in pixels) between the picker container and the reference element.
     *
     * @type {number}
     */
    margin: 0,

    /**
     * Replace the reference element with a pre-styled button.
     *
     * @type {boolean}
     */
    preset: true,

    /**
     * Initial color.
     *
     * @type {string | object}
     */
    color: DEFAULT_COLOR,

    /**
     * Default color.
     *
     * @type {string | object}
     */
    default: DEFAULT_COLOR,

    /**
     * Target can be a selector or an HTML element,
     * If the option popover is true, the picker container will be positioned relative to this element,
     * instead of the reference element.
     * else if popover option is false, the picker container will be appended as a child into this element.
     *
     * @type {string | Element}
     */
    target: '',

    /**
     * Disable the picker, users won't be able to pick colors.
     *
     * @type {boolean}
     */
    disabled: false,

    /**
     * Initial color format.
     *
     * @type {string}
     */
    format: 'rgb',

    /**
     * For the formats 'hsl' and 'rgb', choose a single input to display the color string,
     * or if false, display an input for each color channel.
     *
     * @type {boolean}
     */
    singleInput: false,

    /**
     * Input(s) field(s) for each color format. if this option is set to true then all formats are,
     * selected.
     *
     * @type {boolean | object}
     */
    inputs: {
        rgb: true,
        hex: true,
        hsl: true,
    },

   /**
    * Support alpha channel and display opacity slider.
    *
    * @type {boolean}
    */
    opacity: true,

    /**
     * Preview the color.
     *
     * @type {boolean}
     */
    preview: true,

    /**
     * Add/Remove a copy button.
     *
     * @type {boolean}
     */
    copy: true,

    /**
     * Array of color swatches, invalid values will default to the DEFAULT_COLOR.
     *
     * @type {Array<string | object>}
     */
    swatches: [],

    /**
     * Share components with multiple alwan instances.
     *
     * @type {boolean}
     */
    shared: false,

    /**
     * Make swatches container collapsible.
     *
     * @type {boolean}
     */
    toggleSwatches: false,
}