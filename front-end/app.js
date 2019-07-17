import {
    Route
} from '/mindnote/service/route.js';

import {
    RESPONSE_STATUS,
    API
} from '/mindnote/config.js';

import {
    api
} from '/mindnote/service/api.v2.js';

import {
    MindnoteError
} from '/mindnote/util/mindnote-error.js';

import {
    Toaster
} from '/mindnote/service/toaster.js';

// double tap node will trigger `double-tap-node` event
export const APP = {
    GoogleAuth: null,
    run: () => {
        window.addEventListener('error', (e) => {
            if (e.error && e.error instanceof MindnoteError) {
                Toaster.popup(e.error.type, e.error.reason);
                e.stopPropagation();
                e.preventDefault();
                return;
            }
        });

        window.addEventListener("unhandledrejection", function (e) {
            if (e.reason && e.reason instanceof MindnoteError) {
                Toaster.popup(e.reason.type, e.reason.reason);
                e.stopPropagation();
                e.preventDefault();
                return;
            }
        });

        api.init(API, RESPONSE_STATUS);
        Route.init(APP);
    }
}