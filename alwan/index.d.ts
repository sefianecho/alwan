// Type definitions for Alwan 1.2.0
// Project: Alwan
// Definitions by: Sefiane Chouaib.

declare class Alwan {
    static version: string;
    static defaults: Alwan.alwanOptions;

    constructor(reference: string|Element, options: Alwan.alwanOptions);

    setOptions(options: Alwan.alwanOptions): void;
    isOpen(): boolean;
    open(): void;
    close(): void;
    toggle(): void;
    on(type: Alwan.alwanEventType, listener: Alwan.alwanEventListener): void;
    off(type?: Alwan.alwanEventType, listener?: Alwan.alwanEventListener): void;
    setColor(color: Alwan.Color): Alwan;
    getColor(): Alwan.colorValue;
    addSwatches(...swatches: Alwan.Color[]): void;
    removeSwatches(...swatches: Array<Alwan.Color | number>): void;
    enable(): void;
    disable(): void;
    reset(): void;
    reposition(): void;
    trigger(type: Alwan.alwanEventType): void;
    destroy(): void;
}

declare namespace Alwan {

    interface RGB {
        r: number;
        g: number;
        b: number;
    }

    interface RGBA extends RGB {
        a: number;
    }

    interface HSL {
        h: number;
        s: number;
        l: number;
    }

    interface HSLA extends HSL {
        a: number;
    }


    export type Color = string | RGBA | RGB | HSL | HSLA;

    type colorFormat = 'rgb'|'hsl'|'hex';

    export type alwanEventType = 'open' | 'close' | 'change' | 'color';

    type side = 'top' | 'right' | 'bottom'| 'left';
    type alignment = 'start' | 'center' | 'end';
    type position = side | `${side}-${alignment}`;
    export interface colorValue {
       readonly h: number;
       readonly s: number;
       readonly l: number;

       readonly r: number;
       readonly g: number;
       readonly b: number;

       readonly a: number;

       readonly rgb: string;
       readonly hsl: string;
       readonly hex: string;
    }

    interface alwanEvent extends colorValue {
        readonly type: alwanEventType,
        readonly source: HTMLElement | undefined,
    }

    export type alwanEventListener = (ev: alwanEvent) => void;

    export interface alwanOptions {
        id?: string,
        classname?: string,
        theme?: 'light'|'dark',
        toggle?: boolean,
        popover?: boolean,
        position?: position,
        margin?: number,
        preset?: boolean,
        color?: Color,
        default?: Color,
        target?: string|Element,
        disabled?: boolean,
        format?: colorFormat,
        singleInput?: boolean,
        inputs?: boolean | {
            rgb?: boolean,
            hex?: boolean,
            hsl?: boolean,
        },
        opacity?: boolean,
        preview?: boolean,
        copy?: boolean,
        swatches?: Array<Color>,
        shared?: boolean,
        toggleSwatches?: boolean,
        closeOnScroll?: boolean,
        i18n?: {
            palette?: string,
            buttons?: {
                copy?: string,
                changeFormat?: string,
                swatch?: string
            },
            sliders?: {
                hue?: string,
                alpha?: string,
            }
        }
    }
}

export default Alwan;