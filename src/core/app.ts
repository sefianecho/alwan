import type Alwan from "..";
import {
	Inputs,
	Palette,
	Reference,
	Sliders,
	Swatches,
	Utility,
} from "../components";
import {
	ALWAN_CLASSNAME,
	CONTAINER_CLASSNAME,
	OPEN_CLASSNAME,
} from "../constants/classnames";
import { CLOSE, OPEN } from "../constants/globals";
import { createPopover } from "../popover";
import type {
	HTMLElementHasDisabled,
	IPopover,
	alwanApp,
	alwanConfig,
} from "../types";
import {
	appendChildren,
	createDivElement,
	getBody,
	getElements,
	getInteractiveElements,
	removeElement,
	setInnerHTML,
	toggleClassName,
} from "../utils/dom";
import { isString, isset } from "../utils/is";
import { deepMerge, merge } from "../utils/object";

export const createApp = (alwan: Alwan, ref: string | Element): alwanApp => {
	const { config, _color: colorState } = alwan;

	const root = createDivElement(ALWAN_CLASSNAME);
	const reference = Reference(alwan, getElements(ref)[0]);

	const palette = Palette(alwan);
	const sliders = Sliders(alwan);
	const inputs = Inputs(alwan);
	const components = [
		palette,
		{
			_init: (config: alwanConfig) =>
				createDivElement(
					CONTAINER_CLASSNAME,
					...[Utility(alwan), sliders].map((component) =>
						component._init(config),
					),
				),
		},
		inputs,
		Swatches(alwan),
	];

	let isOpen = false;
	let popoverInstance: IPopover | null = null;

	colorState._setUIElements(root, palette, sliders, inputs);

	return {
		_setup(options) {
			options = options || {};
			const self = this;
			const { id, color } = options;
			const { theme, parent, toggle, popover, target, disabled } =
				deepMerge(config, options);
			const refElement = <HTMLElement>reference._init(config);
			const parentElement = getElements(parent)[0];
			const targetElement = getElements(target)[0];

			colorState._setRef(refElement);

			removeElement(root);
			setInnerHTML(root, "");
			appendChildren(
				root,
				...components.map((component) => component._init(config)),
			);

			isString(id) && (root.id = id);

			merge(root.dataset, {
				theme,
				display: popover ? "popover" : "block",
			});

			if (!toggle) {
				self._toggle(true, true);
			}

			// Hide reference element if both toggle and popover options are set to false,
			refElement.style.display = popover || toggle ? "" : "none";

			if (popoverInstance) {
				popoverInstance._destroy();
				popoverInstance = null;
			}
			if (popover) {
				appendChildren(parentElement || getBody(), root);
				popoverInstance = createPopover(
					targetElement || refElement,
					root,
					refElement,
					config,
					self,
				);
			} else {
				// If there is a target element  or a parent element then append
				// the color picker widget in it, otherwise insert it after the reference element.
				if (targetElement || parentElement) {
					appendChildren(targetElement || parentElement, root);
				} else {
					refElement.after(root);
				}
			}

			if (isset(color)) {
				colorState._setColor(color);
			}

			// Disable/Enable color picker.
			[refElement, ...getInteractiveElements(root)].forEach(
				(element) =>
					((element as HTMLElementHasDisabled).disabled = !!disabled),
			);
			if (disabled) {
				if (popover) {
					self._toggle(false, true);
				} else if (!toggle) {
					self._toggle(true, true);
				}
			}

			// Update ui.
			colorState._update({}, true, true, true);
		},

		_toggle(state = !isOpen, forced = false) {
			if (
				state !== isOpen &&
				(!config.disabled || (forced && (!state || !config.popover))) &&
				(config.toggle || forced)
			) {
				if (state && popoverInstance) {
					popoverInstance._reposition();
				}
				isOpen = state;
				toggleClassName(root, OPEN_CLASSNAME, state);
				alwan._events._emit(isOpen ? OPEN : CLOSE);
			}
		},

		_isOpen: () => isOpen,

		_reposition() {
			if (popoverInstance) {
				popoverInstance._reposition();
			}
		},

		_destroy() {
			removeElement(root);
			if (popoverInstance) {
				popoverInstance._destroy();
			}
			reference._destroy();
		},
	};
};
