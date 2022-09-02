
import { getElement } from "./utils/dom";
import { merge } from "./utils/object";
import { defaults } from "./defaults";
import { createComponents } from "./core";
import '../sass/talwin.scss';

export default class Talwin {

    static defaults = defaults;

    constructor(reference, options) {
        
        reference = getElement(reference);
        
        const talwin = this;
        talwin.config = merge({}, Talwin.defaults, options);
        talwin._ui = createComponents(reference, talwin);
    }
}