import { createElement, getBounds } from "../utils/dom"
import { Marker } from "./Marker";

export const Palette = (parent, talwin) => {

    const el = createElement('', 'talwin__palette', parent, { tabindex: '0' });

    const marker = Marker(el);

    const { WIDTH, HEIGHT } = getBounds(el);

    return {
        el,
        marker,
    }
}