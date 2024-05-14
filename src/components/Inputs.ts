import type Alwan from "..";
import { switchInputsSVG } from "../assets/svg";
import { stringify } from "../colors/stringify";
import {
	CONTAINER_CLASSNAME,
	INPUTS_CLASSNAME,
	INPUT_CLASSNAME,
} from "../constants/classnames";
import {
	CHANGE,
	CLICK,
	COLOR_FORMATS,
	ENTER,
	FOCUS_IN,
	HEX_FORMAT,
	INPUT,
	KEY_DOWN,
} from "../constants/globals";
import { addEvent } from "../core/events/binder";
import type {
	HSLA,
	IInputs,
	InputFormats,
	RGBA,
	colorDetails,
	colorFormat,
} from "../types";
import {
	appendChildren,
	createButton,
	createDivElement,
	createElement,
	setInnerHTML,
} from "../utils/dom";
import { max } from "../utils/math";
import { ObjectForEach } from "../utils/object";

export const Inputs = (alwan: Alwan): IInputs => {
	let { config, _color: colorState } = alwan;
	let container: HTMLDivElement | null;
	let inputsWrapper: HTMLDivElement | null;
	let switchButton: HTMLButtonElement | null;
	let formats: colorFormat[] = [];
	let currentFormatIndex: number;
	let inputsMap: Partial<Record<keyof colorDetails, HTMLInputElement>>;
	let isChanged = false;
	let isSingle: boolean;

	const handleChange = () => {
		let color: Partial<Record<keyof colorDetails, number | string>> = {};
		let format = formats[currentFormatIndex];

		if (!isChanged) {
			colorState._cache();
			isChanged = true;
		}

		ObjectForEach(inputsMap, (key, input) => (color[key] = input!.value));

		colorState._setColor(
			isSingle
				? <string>color[format]
				: stringify(<RGBA | HSLA>color, format),
			false,
		);
	};

	const buildInputs = () => {
		if (inputsWrapper) {
			inputsMap = {};
			// Remove all inputs.
			setInnerHTML(inputsWrapper, "");
			isSingle =
				formats[currentFormatIndex] === HEX_FORMAT ||
				config.singleInput;
			const format = formats[currentFormatIndex];
			// For multiple inputs, each character in the color format represent an input field.
			const fields = isSingle
				? [format]
				: (format + (config.opacity ? "a" : "")).split("");
			const colorValue = colorState._value;

			appendChildren(
				inputsWrapper,
				...fields.map((field) => {
					inputsMap[<keyof colorDetails>field] = createElement(
						INPUT,
						INPUT_CLASSNAME,
						[],
						"",
						{
							type: "text",
							value: colorValue[<keyof colorDetails>field],
						},
					);
					return createElement("label", "", [
						inputsMap[<keyof colorDetails>field]!,
						createElement("span", "", [], field),
					]);
				}),
			);
		}
	};

	const changeFormat = () => {
		currentFormatIndex = (currentFormatIndex + 1) % formats.length;
		colorState._setFormat(formats[currentFormatIndex]);
		buildInputs();
	};

	return {
		_init({ inputs, format, i18n }) {
			container = inputsWrapper = switchButton = null;
			formats = COLOR_FORMATS;

			if (inputs !== true) {
				inputs = inputs || {};
				formats = formats.filter(
					(format) => (<InputFormats>inputs)[format],
				);
			}
			const formatsLength = formats.length;
			if (!formatsLength) {
				formats = COLOR_FORMATS;
			}
			// validate the format option.
			currentFormatIndex = max(formats.indexOf(format), 0);
			colorState._setFormat(formats[currentFormatIndex]);

			if (formatsLength) {
				if (formatsLength > 1) {
					switchButton = createButton(
						i18n.buttons.changeFormat,
						"",
						switchInputsSVG,
					);
					addEvent(switchButton, CLICK, changeFormat);
				}
				inputsWrapper = createDivElement(INPUTS_CLASSNAME);
				container = createDivElement(
					CONTAINER_CLASSNAME,
					inputsWrapper,
					switchButton,
				);

				addEvent(inputsWrapper, INPUT, handleChange);
				addEvent(inputsWrapper, CHANGE, () => {
					colorState._change();
					isChanged = false;
				});
				addEvent(inputsWrapper, FOCUS_IN, (e: Event) =>
					(<HTMLInputElement>e.target).select(),
				);
				// Pressing Enter causes the picker to close.
				addEvent(
					inputsWrapper,
					KEY_DOWN,
					(e: Event) =>
						(e as KeyboardEvent).key === ENTER &&
						alwan._app._toggle(false),
				);

				buildInputs();
			}

			return container;
		},

		_setValues(color) {
			if (!isChanged) {
				ObjectForEach(
					inputsMap || {},
					(key, input) => (input!.value = color[key] + ""),
				);
			}
		},
	};
};
