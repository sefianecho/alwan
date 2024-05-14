import type Alwan from "..";
import { BUTTON_CLASSNAME, REFERENCE_CLASSNAME } from "../constants/classnames";
import { CLICK } from "../constants/globals";
import { addEvent, removeEvent } from "../core/events/binder";
import type { IReference } from "../types";
import {
	appendChildren,
	createButton,
	getBody,
	removeElement,
	replaceElement,
} from "../utils/dom";
import { isString } from "../utils/is";

export const Reference = (
	alwan: Alwan,
	element: Element | undefined,
): IReference => {
	let refElement: Element;
	const body = getBody();
	const userRef =
		element && element !== body && body.contains(element) ? element : null;

	const handleClick = () => alwan._app._toggle();

	if (userRef) {
		refElement = userRef;
	} else {
		refElement = createButton();
		appendChildren(body, refElement);
	}

	return {
		_init({ preset, classname }) {
			// userRef !== element means preset button is not set.
			if (userRef && preset != (userRef !== refElement)) {
				if (preset) {
					// Replace user reference with a preset button.
					refElement = replaceElement(userRef, createButton());
					if (userRef.id) {
						refElement.id = userRef.id;
					}
				} else {
					// Replace preset button with the user reference.
					refElement = replaceElement(refElement, userRef);
				}
			}

			addEvent(refElement, CLICK, handleClick);

			// Add classes to the preset button.
			if (!userRef || preset) {
				refElement.className =
					BUTTON_CLASSNAME +
					REFERENCE_CLASSNAME +
					(isString(classname) ? classname.trim() : "");
			}

			return refElement;
		},

		_destroy() {
			if (userRef) {
				removeEvent(userRef, CLICK, handleClick);
				if (userRef !== refElement) {
					replaceElement(refElement, userRef);
				}
			} else {
				removeElement(refElement);
			}
		},
	};
};
