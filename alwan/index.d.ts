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
    on(type: Alwan.alwanEvent, handler: Alwan.Handler): void;
    off(type?: Alwan.alwanEvent, handler?: Alwan.Handler): void;
    setColor(color: Alwan.Color): Alwan;
    getColor(): Alwan.colorValue;
    addSwatch(color: Alwan.Color): void;
    removeSwatch(swatch: string|number): void;
    enable(): void;
    disable(): void;
    reset(): void;
    reposition(): void;
    trigger(type: Alwan.alwanEvent): void;
    destroy(): void;
}

declare namespace Alwan {


    type stringify = () => string;


    interface RGB {
        r: number,
        g: number,
        b: number,
        a?: number,
        toString?: stringify
    }

    interface HSL {
        h: number,
        s: number,
        l: number,
        a?: number,
        toString?: stringify
    }


    export type Color = string|RGB|HSL;
    type colorArray = [number, number, number, number?, stringify?];

    type colorFormat = 'rgb'|'hsl'|'hex';

    export type alwanEvent = 'open'|'close'|'change'|'color';

    type side = 'top'|'right'|'bottom'|'left';
    type alignement = 'start'|'center'|'end';
    type position = side | `${side}-${alignement}`;


    interface colorValue {
        value: string,
        rgb: (asArray?: boolean) => RGB|colorArray,
        hsl: (asArray?: boolean) => HSL|colorArray,
        hex: () => string,
    }

    interface Event extends colorValue {
        type: alwanEvent,
        source?: Element|Alwan,
    }

    export type Handler = (ev: Event) => void;

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
        inputs?: {
            rgb?: boolean,
            hex?: boolean,
            hsl?: boolean,
        },
        opacity?: boolean,
        preview?: boolean,
        copy?: boolean,
        swatches?: Array<Color>,
        shared?: boolean,
        toggleSwatches?: boolean
    }
}

export default Alwan;