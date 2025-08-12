import { Alwan } from "../alwan";
import type { Component, alwanConfig } from "../types";
import { createContainer } from "../utils/dom";
import { isArray } from "../utils/object";
import { Inputs } from "./Inputs";
import { Palette } from "./Palette";
import { Sliders } from "./Sliders";
import { Swatches } from "./Swatches";
import { Utility } from "./Utility";

export const createComponents = (alwan: Alwan) =>
    [Palette, Utility, Sliders, Inputs, Swatches].map<Component>((component) =>
        component(alwan),
    );

export const renderComponents = (
    components: Array<Component | Component[]>,
    config: alwanConfig,
): Array<Element | null> =>
    components.map((component) =>
        isArray(component)
            ? createContainer(renderComponents(component, config))
            : component._init(config),
    );
