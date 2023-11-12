import type Alwan from '.';

export interface alwanConfig {
    /**
     * Set the container's (widget) id.
     *
     * @default ``
     */
    id: string;

    /**
     * Add classes (separated by a white space) to the preset button.
     *
     * @default ``
     */
    classname: string;

    /**
     * Choose a theme.
     *
     * @default `light`
     */
    theme: 'light' | 'dark';

    /**
     * Toggle picker's visibility (Show/Hide), Setting this to false keeps the picker visible.
     *
     * @default `true`
     */
    toggle: boolean;

    /**
     * Display the picker container as a pop-up (a box that floats on top of the page content),
     * if it's false, picker container will be displayed as a block (embedded in the page's content).
     *
     * @default `true`
     */
    popover: boolean;

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
     * @default `bottom-start`
     */
    position: popoverPosition;

    /**
     * Set the gap (in pixels) between the picker container and the reference element.
     *
     * @default `0`
     */
    margin: number;

    /**
     * Replace the reference element with a pre-styled button.
     *
     * @default `true`
     */
    preset: boolean;

    /**
     * Initial color.
     *
     * @default `#000`
     */
    color: Color;

    /**
     * Default color.
     *
     * @default `#000`
     */
    default: Color;

    /**
     * Target can be a selector or an HTML element,
     * If the option popover is true, the picker container will be positioned relative to this element,
     * instead of the reference element.
     * else if popover option is false, the picker container will be appended as a child into this element.
     *
     * @default ``
     */
    target: string | Element;

    /**
     * Disable the picker, users won't be able to pick colors.
     *
     * @default `false`
     */
    disabled: boolean;

    /**
     * Initial color format.
     *
     * @default `rgb`
     */
    format: colorFormat;

    /**
     * For the formats 'hsl' and 'rgb', choose a single input to display the color string,
     * or if false, display an input for each color channel.
     *
     * @default `false`
     */
    singleInput: boolean;

    /**
     * Input(s) field(s) for each color format. if this option is set to true then all formats are,
     * selected.
     *
     * @default `true`
     */
    inputs: boolean | InputFormats;

    /**
     * Support alpha channel and display opacity slider.
     *
     * @default `true`
     */
    opacity: boolean;

    /**
     * Preview the color.
     *
     * @default `true`
     */
    preview: boolean;

    /**
     * Add/Remove a copy button.
     *
     * @default `true`
     */
    copy: boolean;

    /**
     * Array of color swatches, invalid values will default to the DEFAULT_COLOR.
     *
     * @default `[]`
     */
    swatches: Color[];

    /**
     * Make swatches container collapsible.
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
        palette: string;
        buttons: {
            copy: string;
            changeFormat: string;
            swatch: string;
        };
        sliders: {
            hue: string;
            alpha: string;
        };
    };
}

type Optional<T> = {
    [P in keyof T]?: T[P] extends Color ? Color : Optional<T[P]>;
};

export type alwanOptions = Optional<alwanConfig>;

export type side = 'top' | 'right' | 'bottom' | 'left';
export type alignment = 'start' | 'center' | 'end';
export type popoverPosition = side | `${side}-${alignment}`;

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
}

export interface A {
    a: number;
}

export interface RGBA extends RGB, A {}
export interface HSLA extends HSL, A {}

export interface colorDetails extends RGB, HSL, A, Record<colorFormat, string> {}
export type Color = string | RGB | RGBA | HSL | HSLA;
export type colorFormat = 'rgb' | 'hsl' | 'hex';
export type InputFormats = Partial<Record<colorFormat, boolean>>;

export type Attrs = Record<string, string | number>;
export type DOMRectArray = [
    x: number,
    y: number,
    width: number,
    height: number,
    right: number,
    bottom: number
];

export interface alwanValue extends Readonly<colorDetails> {}
export interface IColorState {
    _value: colorDetails;
    _update(hsl: Partial<HSLA>, componentId?: number, triggerEvent?: boolean, rgb?: RGBA): void;
    _setColor(
        color: Color,
        componentId?: number,
        triggerChange?: boolean,
        triggerColor?: boolean
    ): void;
    _setFormat(format: colorFormat): void;
    _cache(): void;
    _change(): void;
    _colorString(): string;
}

export type alwanEventType = 'open' | 'close' | 'color' | 'change';
export interface alwanEvent extends alwanValue {
    readonly type: alwanEventType;
    readonly source: Alwan;
}
export type alwanEventListener = (ev: alwanEvent) => void;
export type alwanEventAndListenersMap = Record<alwanEventType, alwanEventListener[]>;
export interface EventEmitter {
    _emit(type: alwanEventType, value?: colorDetails): void;
    _on(type: alwanEventType, listener: alwanEventListener): void;
    _off(type?: alwanEventType, listener?: alwanEventListener): void;
}

export type EventListenerBinder = (
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
) => void;

// Components.
export interface Component {
    _init(config: alwanConfig): void;
}

export interface IPalette extends Component {
    el: HTMLDivElement;
    _updateMarker(s: number, v: number): void;
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
    _el(): Element;
    _destroy(): void;
}

export interface alwanApp {
    _setup(options?: alwanOptions): void;
    _update(state: colorDetails, componentId?: number): void;
    _isOpen(): boolean;
    _toggle(state?: boolean, forced?: boolean): void;
    _reposition(): void;
    _destroy(): void;
}

export interface IPopover {
    _update(): void;
    _destroy(): void;
}

export type LabeledElement =
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLButtonElement
    | ElementInternals
    | HTMLMeterElement
    | HTMLOutputElement
    | HTMLProgressElement
    | HTMLTextAreaElement;

export type HTMLElementHasDisabled =
    | HTMLButtonElement
    | HTMLFieldSetElement
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLOptionElement
    | HTMLTextAreaElement
    | HTMLOptGroupElement;

export interface Slider {
    el: HTMLDivElement;
    _setValue(newValue: number): void;
}

export type SliderConstructor = (
    classname: string,
    targetElement: Element,
    onChange: (value: number, source: HTMLElement, stop?: boolean) => void,
    max: number,
    step: number,
    rtl?: boolean
) => Slider;
