import type Alwan from "..";
import { HSLToRGB, RGBToHEX, RGBToHSL } from "../colors/conversions";
import { parseColor } from "../colors/parser";
import { stringify } from "../colors/stringify";
import { CHANGE, COLOR, HSL_FORMAT, RGB_FORMAT } from "../constants/globals";
import type {
	HSLA,
	IColorState,
	IInputs,
	IPalette,
	ISliders,
	RGBA,
	colorDetails,
	colorFormat,
} from "../types";
import { setCustomProperty } from "../utils/dom";
import { round } from "../utils/math";
import { merge } from "../utils/object";

export const colorState = (alwan: Alwan): IColorState => {
	const state: colorDetails = {
		h: 0,
		s: 0,
		l: 0,

		r: 0,
		g: 0,
		b: 0,

		a: 1,

		rgb: "",
		hsl: "",
		hex: "",
	};
	const config = alwan.config;
	const emitEvent = alwan._events._emit;
	let referenceElement: HTMLElement;
	let rootElement: HTMLElement;
	let paletteComponent: IPalette;
	let slidersComponent: ISliders;
	let inputsComponent: IInputs;
	let currentFormat: colorFormat;
	let cashedColor: string;

	return {
		_value: state,

		_getColorString: () => state[currentFormat],

		_setFormat(format) {
			currentFormat = config.format = format;
		},

		_setRef(ref) {
			referenceElement = ref;
		},

		_setUIElements(root, palette, sliders, inputs) {
			rootElement = root;
			paletteComponent = palette;
			slidersComponent = sliders;
			inputsComponent = inputs;
		},

		_update(
			hsl,
			triggerColorEvent = true,
			ignoreRGB,
			updatePaletteAndSliders,
		) {
			const previousHex = state.hex;

			merge(state, hsl);
			!ignoreRGB && merge(state, HSLToRGB(state));

			state.s = round(state.s);
			state.l = round(state.l);

			state.rgb = stringify(state);
			state.hsl = stringify(state, HSL_FORMAT);
			state.hex = RGBToHEX(state);

			setCustomProperty(referenceElement, COLOR, state.rgb);
			setCustomProperty(
				rootElement,
				RGB_FORMAT,
				`${state.r},${state.g},${state.b}`,
			);
			setCustomProperty(rootElement, "a", state.a);
			setCustomProperty(rootElement, "h", state.h);
			inputsComponent._setValues(state);

			if (updatePaletteAndSliders) {
				slidersComponent._setValues(state.h, state.a);
				paletteComponent._updateMarker(state.s, state.l);
			}

			if (triggerColorEvent && previousHex !== state.hex) {
				emitEvent(COLOR, state);
			}
		},

		_setColor(color, triggerColorEvent = false, triggerChangeEvent) {
			const [colorObject, colorFormat] = <[RGBA | HSLA, colorFormat]>(
				parseColor(color)
			);
			const isRGB = colorFormat === RGB_FORMAT;

			if (!config.opacity) {
				colorObject.a = 1;
			}

			if (state[colorFormat] !== stringify(colorObject, colorFormat)) {
				merge(
					state,
					colorObject,
					isRGB ? RGBToHSL(<RGBA>colorObject) : {},
				);
				this._update({}, triggerColorEvent, isRGB, true);

				if (triggerChangeEvent) {
					emitEvent(CHANGE, state);
				}
			}
		},

		_cache() {
			cashedColor = state[currentFormat];
		},

		/**
		 * Emit change event if the color have changed compared to the cashed color.
		 */
		_change() {
			if (cashedColor !== state[currentFormat]) {
				emitEvent(CHANGE, state);
			}
		},
	};
};
