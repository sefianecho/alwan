import type Alwan from "..";
import { checkSVG, clipboardSVG } from "../assets/svg";
import {
	COPY_BUTTON_CLASSNAME,
	PREVIEW_CLASSNAME,
} from "../constants/classnames";
import {
	BLUR,
	CLICK,
	DOC_ELEMENT,
	INPUT,
	MOUSE_OUT,
	ROOT,
} from "../constants/globals";
import { addEvent } from "../core/events/binder";
import type { IUtility } from "../types";
import {
	appendChildren,
	createButton,
	createDivElement,
	createElement,
	removeElement,
	setInnerHTML,
} from "../utils/dom";

/**
 * Color preview and copy Button.
 */
export const Utility = (alwan: Alwan): IUtility => {
	let previewElement: HTMLDivElement | null;
	let copyButton: HTMLButtonElement | null;
	let isCopied = false;

	const setButtonIcon = (state: boolean) => {
		isCopied = state;
		setInnerHTML(copyButton!, state ? checkSVG : clipboardSVG);
	};

	const fallback = (color: string) => {
		const input = createElement(INPUT);
		appendChildren(DOC_ELEMENT, input);
		input.value = color;
		input.select();
		ROOT.execCommand("copy");
		removeElement(input);
		copyButton!.focus();
		// change icon.
		setButtonIcon(true);
	};

	const copyColor = () => {
		if (!isCopied) {
			const clipboard = navigator.clipboard;
			const color = alwan._color._getColorString();

			if (clipboard) {
				clipboard
					.writeText(color)
					.then(() => setButtonIcon(true))
					.catch(() => fallback(color));
			} else {
				fallback(color);
			}
		}
	};

	return {
		_init({ preview, copy, i18n }) {
			previewElement = copyButton = null;

			if (copy) {
				copyButton = createButton(
					i18n.buttons.copy,
					COPY_BUTTON_CLASSNAME,
					clipboardSVG,
				);

				addEvent(copyButton, CLICK, copyColor);
				// Reset clipboard icon.
				addEvent(
					copyButton,
					BLUR,
					() => isCopied && setButtonIcon(false),
				);
				addEvent(copyButton, MOUSE_OUT, () => copyButton!.blur());
			}

			if (preview) {
				previewElement = createDivElement(
					PREVIEW_CLASSNAME,
					copyButton,
				);
			}

			return previewElement || copyButton;
		},
	};
};
