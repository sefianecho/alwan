import { alwanConfig } from "./types";
import { createButton, getBody, replaceElement } from "./utils/dom";

export const getRef = (
    ref: Element,
    userRef: Element | null,
    config: alwanConfig,
) => {
    ref = replaceElement(
        ref,
        config.preset || !userRef
            ? createButton("", "alwan__ref " + config.classname, "", "", {
                  id: userRef ? userRef.id : "",
              })
            : userRef,
    );

    if (!ref.parentElement) {
        getBody().append(ref);
    }

    return ref;
};
