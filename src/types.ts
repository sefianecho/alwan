import type Alwan from ".";

export interface alwanConfig {
    /**
     * Assign an ID to the color picker widget.
     *
     * @default ``
     */
    id: string;

    /**
     * Adds one or more classes (separated by spaces) to the preset button.
     *
     * @default ``
     */
    classname: string;

    /**
     * Choose between the 'dark' and 'light' themes.
     *
     * @default `light`
     */
    theme: "light" | "dark";

    /*
     * Selector or HTML element that the picker container is appended to.
     *
     * @default ``
     */
    parent: string | Element;

    /**
     * Toggles the visibility of the color picker. Setting this option to false
     * keeps the picker always visible.
     *
     * @default `true`
     */
    toggle: boolean;

    /**
     * Determines whether the color picker is displayed as a popover (true)
     * or inline within the page content (false).
     *
     * @default `true`
     */
    popover: boolean;

    /**
     * Sets the popover’s placement relative to the target or reference element.
     * Format: side-alignment (side: top, right, bottom, left; alignment: start,
     * center, end, with center optional).
     * The picker will automatically adjust if there is insufficient space.
     *
     * @default `bottom-start`
     */
    position: popoverPosition;

    /**
     * Sets the distance, in pixels, between the picker container and the popover
     * target element (either target or the reference element).
     *
     * @default `4`
     */
    margin: number;

    /**
     * Replaces the reference element with a pre-styled button.
     *
     * @default `true`
     */
    preset: boolean;

    /**
     * Sets the initial color of the color picker.
     *
     * @default `#000`
     */
    color: Color;

    /**
     * Specifies the default color of the color picker.
     *
     * @default `#000`
     */
    default: Color;

    /**
     * A selector or HTML element used as the reference. When popover is true,
     * the picker is positioned relative to it; when false, the picker is inserted
     * immediately after it.
     *
     * @default ``
     */
    target: string | Element;

    /**
     * Disables the color picker, preventing users from selecting colors.
     *
     * @default `false`
     */
    disabled: boolean;

    /**
     * Determines how the color value is represented (hex, rgb, or hsl).
     *
     * @default `rgb`
     */
    format: colorFormat;

    /**
     * Uses one input for the full color value instead of separate inputs for each
     * color component.
     *
     * @default `false`
     */
    singleInput: boolean;

    /**
     * Controls color input fields. Accepts true (all inputs), false (no inputs),
     * or an object to enable specific formats (e.g., { hsl: true, rgb: false, hex: true }).
     *
     * @default `true`
     */
    inputs: boolean | InputFormats;

    /**
     * Enables alpha channel for transparency.
     *
     * @default `true`
     */
    opacity: boolean;

    /**
     * Adds a preview element for the selected color.
     *
     * @default `true`
     */
    preview: boolean;

    /**
     * Adds a button to copy the selected color.
     *
     * @default `true`
     */
    copy: boolean;

    /**
     * Array of predefined colors displayed as selectable swatches; invalid values
     * default to #000.
     *
     * @default `[]`
     */
    swatches: Swatch[];

    /**
     * Adds a button to toggle the swatches container.
     *
     * @default `false`
     */
    toggleSwatches: boolean;

    /**
     * Close color picker when scrolling, only if the color picker,
     * is displayed as a popover and can be closed.
     *
     * @default `false`
     */
    closeOnScroll: boolean;

    /**
     * Internationalization of the interactive elements labels.
     *
     * @default
     * `{
     *      palette: 'Color picker',
     *      buttons: {
     *          copy: 'Copy color to clipboard',
     *          changeFormat: 'Change color format',
     *          swatch: 'Color swatch',
     *      },
     *      sliders: {
     *          hue: 'Change hue',
     *          alpha: 'Change opacity'
     *      }
     * }`
     */
    i18n: {
        /**
         * Deprecated – Replaced by i18n.picker
         **/
        palette?: string;

        /**
         * ARIA label for the color picking area.
         */
        picker: string;

        buttons: {
            /**
             * ARIA label and title for the copy button.
             */
            copy: string;

            /**
             * ARIA label and title for the change-format button.
             */
            changeFormat: string;

            /**
             * ARIA label for swatch buttons.
             */
            swatch: string;

            /**
             * ARIA label and title for the toggle-swatches button (since v2.0.0).
             */
            toggleSwatches: string;
        };
        sliders: {
            /**
             * ARIA label for the hue slider.
             */
            hue: string;

            /**
             * ARIA label for the alpha slider.
             */
            alpha: string;
        };
    };
}

type Optional<T> = {
    [P in keyof T]?: T[P] extends Color ? T[P] : Optional<T[P]>;
};

export type alwanOptions = Optional<alwanConfig>;

export type side = "top" | "right" | "bottom" | "left";
export type alignment = "start" | "center" | "end";
export type popoverPosition = side | `${side}-${alignment}`;

export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface HSLA {
    h: number;
    s: number;
    l: number;
    a: number;
}

export type colorFormat = "rgb" | "hsl" | "hex";
export interface colorDetails extends RGBA, HSLA, Record<colorFormat, string> {}
export type Color = string | RGBA | HSLA;
export type Swatch = Color | { color: Color, label?: string };
export type InputFormats = Partial<Record<colorFormat, boolean>>;

export type Attrs = Record<string, string | number | boolean | undefined>;
export type DOMRectArray = [
    x: number,
    y: number,
    width: number,
    height: number,
    right: number,
    bottom: number,
];

export type colorStateHook = (color: colorDetails) => void;
export interface alwanValue extends Readonly<colorDetails> {}
export interface IColorState {
    _value: colorDetails;
    _setHooks(onUpdate: colorStateHook, onColorSet: colorStateHook): void;
    _toString(): string;
    _setFormat(format: colorFormat): void;
    _update(
        hsl: Partial<HSLA>,
        rgb?: RGBA | false,
        emitColor?: boolean,
        emitChange?: boolean,
    ): void;
    _parse(color: Color, emitColor?: boolean, emitChange?: boolean): void;
    _cache(): void;
    _change(): void;
}

export type alwanEventType = "open" | "close" | "color" | "change";
export interface alwanEvent extends alwanValue {
    readonly type: alwanEventType;
    readonly source: Alwan;
}
export type alwanEventHandler = (ev: alwanEvent) => void;
export type alwanEventAndListenersMap = Record<
    alwanEventType,
    alwanEventHandler[]
>;
export interface EventEmitter {
    _emit(type: alwanEventType, value?: colorDetails): void;
    _on(type: alwanEventType, listener: alwanEventHandler): void;
    _off(type?: alwanEventType, listener?: alwanEventHandler): void;
}
type EventMap = DocumentEventMap &
    HTMLElementEventMap &
    ShadowRootEventMap &
    WindowEventMap;
export type EventBinder = <T extends EventTarget, U extends keyof EventMap>(
    target: T,
    type: U,
    listener: (e: EventMap[U]) => void,
    options?: boolean | AddEventListenerOptions,
) => void;

// Components.
export interface Component {
    _render(config: alwanConfig): Element | null | undefined;
}

export interface ISelector extends Component {
    _updateCursor(s: number, l: number): void;
}
export interface IUtility extends Component {}
export interface ISliders extends Component {
    _setValues(h: number, a: number): void;
}
export interface IInputs extends Component {
    _setValues(color: colorDetails): void;
}
export interface ISwatches extends Component {}
export interface IReference extends Component {
    _destroy(): void;
}

export interface IController {
    _setup(options: alwanOptions): void;
    _isOpen(): boolean;
    _toggle(state?: boolean, forced?: boolean): void;
    _reposition(): void;
    _destroy(): void;
}

export interface IRefController {
    _getEl(config: alwanConfig): HTMLElement | SVGElement;
    _remove(): void;
}

export interface IPopover {
    _isVisible(): boolean;
    _reposition(isOpenNow: boolean, wasOpenBefore?: boolean): void;
    _destroy(): void;
}
