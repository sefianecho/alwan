import {
	ESCAPE,
	KEY_DOWN,
	POINTER_DOWN,
	RESIZE,
	ROOT,
	SCROLL,
	TAB,
} from "../constants/globals";
import { addEvent, removeEvent } from "../core/events/binder";
import type {
	EventListenerBinder,
	IPopover,
	LabeledElement,
	alignment,
	alwanApp,
	alwanConfig,
	side,
} from "../types";
import {
	getBoundingRectArray,
	getInteractiveElements,
	translate,
} from "../utils/dom";
import { isNumber, isString, isset } from "../utils/is";
import { abs, round } from "../utils/math";
import { toArray } from "../utils/object";
import {
	CENTER,
	END,
	GAP,
	START,
	fallbackAlignments,
	fallbackSides,
} from "./constants";
import { getOffsetParent, getOverflowAncestors, isInViewport } from "./utils";

export const createPopover = (
	target: Element,
	popoverElement: HTMLElement,
	alwanReferenceElement: Element,
	{ margin, position, toggle, closeOnScroll }: alwanConfig,
	{ _isOpen, _toggle }: alwanApp,
): IPopover => {
	margin = isNumber(margin) ? +margin : 0;
	const [side, alignment] = <[side, alignment]>(
		(isString(position) ? position.split("-") : [])
	);
	const sidesFlipOrder = fallbackSides[side] || fallbackSides.bottom;
	const alignmentsFlipOrder =
		fallbackAlignments[alignment] || fallbackAlignments.center;
	const overflowAncestors = getOverflowAncestors(target);
	const popoverStyleDeclaration = popoverElement.style;

	const setPosition = () => {
		popoverStyleDeclaration.height = "";
		const viewportRect = getBoundingRectArray(ROOT);
		const targetRect = getBoundingRectArray(target);
		const popoverRect = getBoundingRectArray(popoverElement);
		const offsetParentRect = getBoundingRectArray(
			getOffsetParent(popoverElement),
			true,
		);

		const coordinates: [x: number | null, y: number | null] = [null, null];

		sidesFlipOrder.some((side) => {
			// Get the axis from the side.
			// 0 (horizontal) if the side is LEFT (1) or RIGHT (4).
			// 1 (vertical) if the side is TOP (0) or BOTTOM (5).
			let axis = side % 2;

			const viewportSide = viewportRect[side];
			const targetSide = targetRect[side];
			// axis + 2 gives the dimension based on the axis,
			// x => width or y => height.
			const spaceForPopover = margin + popoverRect[axis + 2];

			if (spaceForPopover > abs(viewportSide - targetSide)) {
				return false;
			}

			coordinates[axis] =
				targetSide + (side <= 1 ? -spaceForPopover : margin);

			// Reverse the axis for the alignments.
			axis = (axis + 1) % 2;

			// start => top or left positions.
			// end => bottom or right positions.

			const endCoordinateIndex = axis + 4;
			const dimensionIndex = axis + 2;

			const popoverDimension = popoverRect[dimensionIndex];

			const targetStart = targetRect[axis];
			const targetEnd = targetRect[endCoordinateIndex];

			const viewportEnd = viewportRect[endCoordinateIndex] - targetStart;

			const offset = (popoverDimension + targetRect[dimensionIndex]) / 2;

			alignmentsFlipOrder.some((alignment) => {
				if (alignment == START && popoverDimension <= viewportEnd) {
					coordinates[axis] = targetStart;
					return true;
				}
				if (
					alignment == CENTER &&
					offset <= targetEnd &&
					offset <= viewportEnd
				) {
					coordinates[axis] = targetEnd - offset;
					return true;
				}
				if (alignment == END && popoverDimension <= targetEnd) {
					coordinates[axis] = targetEnd - popoverDimension;
					return true;
				}
				return false;
			});

			return true;
		});

		translate(
			popoverElement,
			...(<[x: number, y: number]>coordinates.map((value, axis) => {
				// Set a dynamic height if the popover height is greater than
				// the viewport height.
				if (
					axis &&
					value === null &&
					popoverRect[3] > viewportRect[5]
				) {
					popoverStyleDeclaration.height =
						viewportRect[5] - GAP * 2 + "px";
					popoverRect[3] = viewportRect[5] - GAP;
				}

				return round(
					(isset(value)
						? value
						: // center the popover relative to the viewport.
							(viewportRect[axis + 4] - popoverRect[axis + 2]) /
							2) - offsetParentRect[axis],
				);
			})),
		);
	};

	const updatePosition = ({ type }: Event) => {
		if (_isOpen() || !toggle) {
			if (isInViewport(target, overflowAncestors)) {
				if (_isOpen()) {
					setPosition();

					if (closeOnScroll && type === SCROLL) {
						_toggle(false);
					}
				} else {
					// This is reachable only if toggle is false.
					// open picker if the reference becomes visible.
					_toggle(true, true);
				}
			} else {
				// close picker even if the toggle option was set to false.
				_toggle(false, true);
			}
		}
	};

	// Keyboard accessibility.
	const handleKeyboard = (e: Event) => {
		if (_isOpen()) {
			const { target, key, shiftKey } = e as KeyboardEvent;
			if (key === ESCAPE) {
				// Close the picker.
				_toggle(false);
			} else if (key === TAB) {
				const focusableElements =
					getInteractiveElements(popoverElement);
				const firstFocusableElement = focusableElements[0];
				const hasTabbedToPopover =
					target === alwanReferenceElement && !shiftKey;
				const hasTabbedAwayFromPopover =
					(shiftKey && target === firstFocusableElement) ||
					(!shiftKey && target === focusableElements.pop());

				const elementToFocusOn = hasTabbedToPopover
					? firstFocusableElement
					: hasTabbedAwayFromPopover
						? alwanReferenceElement
						: null;

				if (elementToFocusOn) {
					e.preventDefault();
					(<HTMLElement>elementToFocusOn).focus();
				}
			}
		}
	};

	/**
	 * Clicks outside of the popover.
	 */
	const handleBackdropClick = ({ target }: Event) => {
		if (
			_isOpen() &&
			target !== alwanReferenceElement &&
			!popoverElement.contains(target as Node) &&
			!toArray((<LabeledElement>alwanReferenceElement).labels || []).some(
				(label) => label.contains(target as Node),
			)
		) {
			_toggle(false);
		}
	};

	/**
	 * Adds/Removes events.
	 */
	const togglePopoverEvents = (fn: EventListenerBinder) => {
		overflowAncestors.forEach((ancestor) =>
			fn(ancestor, SCROLL, updatePosition),
		);
		fn(window, RESIZE, updatePosition);
		fn(ROOT, KEY_DOWN, handleKeyboard);
		fn(ROOT, POINTER_DOWN, handleBackdropClick);
	};

	togglePopoverEvents(addEvent);
	setPosition();

	return {
		_reposition: setPosition,
		_destroy() {
			togglePopoverEvents(removeEvent);
			popoverStyleDeclaration.transform = "";
		},
	};
};
