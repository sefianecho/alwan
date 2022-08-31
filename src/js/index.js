
import { getElement } from "./utils/dom";
import { merge } from "./utils/object";
import '../sass/talwin.scss';
import { createComponents } from "./components";
import { EventBinder } from "./core/events/EventBinder";

export default class Talwin {

    static defaults = {}

    constructor(reference, options) {
        
        reference = getElement(reference);
        
        const talwin = this;
        talwin.config = merge({}, Talwin.defaults, options);
        talwin._e = EventBinder();
        talwin._ui = createComponents(reference, talwin);
    }

}