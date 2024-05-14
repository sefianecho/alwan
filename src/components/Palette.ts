import type Alwan from "..";
import {
	BACKDROP_CLASSNAME,
	MARKER_CLASSNAME,
	PALETTE_CLASSNAME,
} from "../constants/classnames";
import {
	ARIA_LABEL,
	ARROW_KEYS,
	BLUR,
	DOC_ELEMENT,
	KEY_DOWN,
	POINTER_DOWN,
	POINTER_MOVE,
	POINTER_UP,
	ROOT,
} from "../constants/globals";
import { addEvent, removeEvent } from "../core/events/binder";
import { DOMRectArray, IPalette } from "../types";
import {
	createDivElement,
	getBoundingRectArray,
	setAttribute,
	toggleClassName,
	translate,
} from "../utils/dom";
import { clamp, min } from "../utils/math";

/**
 * Color picking area.
 */
export const Palette = ({ _color: colorState }: Alwan): IPalette => {
	let markerX: number;
	let markerY: number;
	let paletteRect: DOMRectArray;
	let isDisabled: boolean;

	const marker = createDivElement(MARKER_CLASSNAME);
	const palette = createDivElement(PALETTE_CLASSNAME, marker);
	const value = { s: 0, l: 0 };

	/**
	 * Moves marker using a pointer (mouse, touch or pen) or keyboard arrow keys.
	 */
	const moveMarkerAndUpdateColor = (
		e: PointerEvent | null,
		[stepX, stepY]: [x: number, y: number] = [0, 0],
	) => {
		let [x, y, width, height] = paletteRect;
		let v: number, l: number;

		if (e) {
			markerX = e.clientX - x;
			markerY = e.clientY - y;
		} else {
			markerX += (stepX * width) / 100;
			markerY += (stepY * height) / 100;
		}
		markerX = clamp(markerX, width);
		markerY = clamp(markerY, height);

		translate(marker, markerX, markerY);

		v = 1 - markerY / height;
		l = v * (1 - markerX / (2 * width));

		value.s = l === 1 || l === 0 ? 0 : ((v - l) / min(l, 1 - l)) * 100;
		value.l = l * 100;
		colorState._update(value);
	};

	const dragMove = (e: Event) => {
		if ((<PointerEvent>e).buttons) {
			moveMarkerAndUpdateColor(e as PointerEvent);
		} else {
			// Stop dragging if the pointer became not active without triggering
			// the pointerup event.
			setDragging(false);
		}
	};

	const dragEnd = () => {
		colorState._change();
		setDragging(false);
	};

	/**
	 * Handles window loses focus while dragging the marker.
	 */
	const windowBlur = () => colorState._change();

	const setDragging = (dragging: boolean) => {
		toggleClassName(DOC_ELEMENT, BACKDROP_CLASSNAME, dragging);
		(dragging ? addEvent : removeEvent)(ROOT, POINTER_MOVE, dragMove);
		(dragging ? addEvent : removeEvent)(window, BLUR, windowBlur);
	};

	addEvent(palette, POINTER_DOWN, (e) => {
		if (!isDisabled) {
			// Drag start.
			colorState._cache();
			paletteRect = getBoundingRectArray(palette);
			moveMarkerAndUpdateColor(<PointerEvent>e);
			// Drag move.
			setDragging(true);
			// Drag end.
			addEvent(ROOT, POINTER_UP, dragEnd, { once: true });
		}
	});

	/**
	 * Moves marker using keyboard arrow keys.
	 */
	addEvent(palette, KEY_DOWN, (e: Event) => {
		const steps = ARROW_KEYS[(<KeyboardEvent>e).key];

		if (steps) {
			e.preventDefault();
			paletteRect = getBoundingRectArray(palette);
			colorState._cache();
			moveMarkerAndUpdateColor(null, steps);
			colorState._change();
		}
	});

	return {
		_init({ i18n, disabled }) {
			setAttribute(palette, ARIA_LABEL, i18n.palette);
			setAttribute(palette, "tabindex", disabled ? "" : 0);
			isDisabled = disabled;

			return palette;
		},

		_updateMarker(s, l) {
			l /= 100;
			s = l + (s / 100) * min(l, 1 - l);
			paletteRect = getBoundingRectArray(palette);
			markerX = (s ? 2 * (1 - l / s) : 0) * paletteRect[2];
			markerY = (1 - s) * paletteRect[3];
			translate(marker, markerX, markerY);
		},
	};
};
