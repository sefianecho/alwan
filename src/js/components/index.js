import { App } from "./App";
import { Palette } from "./Palette";
import { Reference } from "./Reference"

export const createComponents = (reference, talwin) => {
    let ref = Reference(reference, talwin);
    let app = App(talwin);
    let root = app.el;

    let palette = Palette(root, talwin);

    return {
        ref,
        app,
        palette,
    }
}