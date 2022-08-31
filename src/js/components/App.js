import { BODY } from "../constants";
import { createElement } from "../utils/dom";


const TALWIN_CLASSNAME = 'talwin';


export const App = (talwin) => {

    let el = createElement('', TALWIN_CLASSNAME, BODY);

    return {
        el
    }
}