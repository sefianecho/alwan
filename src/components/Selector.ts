import type Alwan from "..";
import {
    KEY_DOWN,
    POINTER_DOWN,
    POINTER_MOVE,
    POINTER_UP,
    ROOT,
} from "../constants";
import { DOMRectArray, ISelector } from "../types";
import {
    createDivElement,
    getBoundingRectArray,
    translate,
    addEvent,
    removeEvent,
} from "../utils/dom";
import { clamp, min } from "../utils/math";

const ARROW_KEYS_X: { [k: string]: number } = {
    ArrowLeft: -1,
    ArrowRight: 1,
};

const ARROW_KEYS_Y: { [k: string]: number } = {
    ArrowUp: -1,
    ArrowDown: 1,
};

export const Selector = ({ s: colorState }: Alwan): ISelector => {
    let selectorEl: HTMLDivElement;
    let cursor: HTMLDivElement;
    let cursorX: number;
    let cursorY: number;
    let selectorBounds: DOMRectArray;

    const sl = { s: 0, l: 0 };

    /**
     * Moves curosr using a pointer (mouse, touch or pen) or keyboard arrow keys.
     */
    const moveCursor = (x: number, y: number) => {
        let [, , width, height] = selectorBounds;
        let v: number, l: number;

        cursorX = x = clamp(x, width);
        cursorY = y = clamp(y, height);

        translate(cursor, x, y);

        v = 1 - y / height;
        l = v * (1 - x / (2 * width));

        sl.s = l === 1 || l === 0 ? 0 : ((v - l) / min(l, 1 - l)) * 100;
        sl.l = l * 100;
        colorState._update(sl);
    };

    const dragMove = ({ x, y, buttons }: PointerEvent) => {
        if (buttons) {
            moveCursor(x - selectorBounds[0], y - selectorBounds[1]);
        } else {
            dragEnd();
        }
    };

    const dragEnd = () => {
        colorState._change();
        removeEvent(ROOT, POINTER_MOVE, dragMove);
        removeEvent(ROOT, POINTER_UP, dragEnd);
    };

    const dragStart = (e: PointerEvent) => {
        selectorEl.setPointerCapture(e.pointerId);
        colorState._cache();
        selectorBounds = getBoundingRectArray(selectorEl);
        moveCursor(e.x - selectorBounds[0], e.y - selectorBounds[1]);
        addEvent(ROOT, POINTER_MOVE, dragMove);
        addEvent(ROOT, POINTER_UP, dragEnd);
    };

    const handleKeyboard = (e: KeyboardEvent) => {
        const key = e.key;
        const stepX = ARROW_KEYS_X[key] || 0;
        const stepY = ARROW_KEYS_Y[key] || 0;
        if (stepX || stepY) {
            e.preventDefault();
            selectorBounds = getBoundingRectArray(selectorEl);
            colorState._cache();
            moveCursor(
                cursorX + (stepX * selectorBounds[2]) / 100,
                cursorY + (stepY * selectorBounds[3]) / 100,
            );
            colorState._change();
        }
    };

    return {
        _render({ i18n, disabled }) {
            cursor = createDivElement("alwan__cursor");
            selectorEl = createDivElement(
                "alwan__selector",
                cursor,
                disabled ? {} : { tabindex: 0 },
                i18n.palette,
            );
            if (!disabled) {
                addEvent(selectorEl, POINTER_DOWN, dragStart);
                addEvent(selectorEl, KEY_DOWN, handleKeyboard);
            }

            return selectorEl;
        },

        _updateCursor(s, l) {
            l /= 100;
            s = l + (s / 100) * min(l, 1 - l);
            selectorBounds = getBoundingRectArray(selectorEl);
            cursorX = (s ? 2 * (1 - l / s) : 0) * selectorBounds[2];
            cursorY = (1 - s) * selectorBounds[3];
            translate(cursor, cursorX, cursorY);
        },
    };
};
