import {
    Route
} from '/mindmap/service/route.js';

import {
    RESPONSE_STATUS,
    API
} from '/mindmap/config.js';

import {
    api
} from '/mindmap/service/api.v2.js';

import {
    MindmapError
} from '/mindmap/util/mindmap-error.js';

import {
    Toaster
} from '/mindmap/service/toaster.js';

// double tap node will trigger `double-tap-node` event
export const APP = {
    GoogleAuth: null,
    run: () => {
        window.addEventListener('error', (e) => {
            if (e.error && e.error instanceof MindmapError) {
                Toaster.popup(e.error.type, e.error.reason);
                e.stopPropagation();
                e.preventDefault();
                return;
            }
        });

        window.addEventListener("unhandledrejection", function (e) {
            if (e.reason && e.reason instanceof MindmapError) {
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