import type Alwan from '..';
import { BACKDROP_CLASSNAME, MARKER_CLASSNAME, PALETTE_CLASSNAME } from '../constants/classnames';
import {
    ARIA_LABEL,
    ARROW_KEYS,
    DOC_ELEMENT,
    KEY_DOWN,
    PALETTE_ID,
    POINTER_DOWN,
    POINTER_MOVE,
    POINTER_UP,
    ROOT,
} from '../constants/globals';
import { addEvent, removeEvent } from '../core/events/binder';
import { DOMRectArray, IPalette } from '../types';
import {
    createDivElement,
    getBounds,
    setAttribute,
    toggleClassNames,
    translate,
} from '../utils/dom';
import { boundNumber, min } from '../utils/math';

/**
 * Color picking area, pick color by dragging the marker.
 *
 * @param param0 - Alwan instance.
 * @param parent - Insert palette element relative to this element.
 * @returns - Palette component.
 */
export const Palette = ({ _color: colorState }: Alwan, parent: HTMLElement): IPalette => {
    let markerX: number;
    let markerY: number;
    let paletteBounds: DOMRectArray;

    const palette = createDivElement(PALETTE_CLASSNAME, parent, { tabindex: '0' });
    const marker = createDivElement(MARKER_CLASSNAME, palette);

    /**
     * Moves marker and updates the color state.
     * Moves it using a pointer (mouse, touch or pen) or keyboard arrow keys.
     *
     * @param e - Pointer Event.
     * @param step - Move marker a step in one of the 4 directions.
     */
    const moveMarkerAndUpdateColor = (
        e: PointerEvent | null,
        [stepX, stepY]: [x: number, y: number] = [0, 0]
    ) => {
        let [x, y, width, height] = paletteBounds;
        let v: number, l: number;

        if (e) {
            markerX = e.clientX - x;
            markerY = e.clientY - y;
        } else {
            markerX += (stepX * width) / 100;
            markerY += (stepY * height) / 100;
        }
        markerX = boundNumber(markerX, width);
        markerY = boundNumber(markerY, height);

        translate(marker, markerX, markerY);

        v = 1 - markerY / height;
        l = v * (1 - markerX / (2 * width));

        colorState._update(
            {
                s: l === 1 || l === 0 ? 0 : ((v - l) / min(l, 1 - l)) * 100,
                l: l * 100,
            },
            palette,
            PALETTE_ID
        );
    };

    /**
     * Dragging the marker.
     *
     * @param e - Pointermove event.
     */
    const drag = (e: Event) => {
        moveMarkerAndUpdateColor(<PointerEvent>e);
    };

    /**
     * Drag end (released the marker).
     */
    const dragEnd = () => {
        colorState._change(palette);
        toggleClassNames(DOC_ELEMENT, BACKDROP_CLASSNAME, false);
        removeEvent(ROOT, POINTER_MOVE, drag);
    };

    /**
     * Starts dragging the marker.
     *
     * @param e - Pointerdown event.
     */
    const dragStart = (e: Event) => {
        colorState._cache();
        paletteBounds = getBounds(palette);
        toggleClassNames(DOC_ELEMENT, BACKDROP_CLASSNAME, true);
        moveMarkerAndUpdateColor(<PointerEvent>e);
        addEvent(ROOT, POINTER_MOVE, drag);
        addEvent(ROOT, POINTER_UP, dragEnd, { once: true });
    };

    /**
     * Moves marker using keyboard arrow keys and adds focus-visible to the palette.
     *
     * @param e - Keydown event.
     */
    const handleKeyboard = (e: Event) => {
        const steps = ARROW_KEYS[(<KeyboardEvent>e).key];

        if (steps) {
            e.preventDefault();
            paletteBounds = getBounds(palette);
            colorState._cache();
            moveMarkerAndUpdateColor(null, steps);
            colorState._change(palette);
        }
    };

    /**
     * Bind events.
     */
    addEvent(palette, POINTER_DOWN, dragStart);
    addEvent(palette, KEY_DOWN, handleKeyboard);

    return {
        /**
         * Palette element.
         */
        el: palette,

        /**
         * Initialize components.
         *
         * @param param0 - Alwan options.
         */
        _init({ i18n }) {
            setAttribute(palette, ARIA_LABEL, i18n.palette);
        },

        /**
         * Updates picker marker's position.
         *
         * @param s - HSL saturation.
         * @param l - HSL lightness
         */
        _updateMarker(s, l) {
            paletteBounds = getBounds(palette);
            let v = l + s * min(l, 1 - l);
            markerX = (v ? 2 * (1 - l / v) : 0) * paletteBounds[2];
            markerY = (1 - v) * paletteBounds[3];
            translate(marker, markerX, markerY);
        },
    };
};
