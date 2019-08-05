import {
    Route
} from '/mindnote/route/route.js';

import {
    RESPONSE_STATUS,
    API
} from '/mindnote/constants.js';

import {
    APP_CONFIG
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

export const APP = {
    GoogleAuth: null,
    run: (isUpdateDOMFirstRunRouting) => {
        window.addEventListener('error', (e) => {
            if (e.error && e.error instanceof MindnoteError) {
                Toaster.popup(e.error.type, e.error.reason);
                e.stopPropagation();
                e.preventDefault();
                return;
            }
        });

        window.addEventListener('unhandledrejection', function (e) {
            if (e.reason && e.reason instanceof MindnoteError) {
                Toaster.popup(e.reason.type, e.reason.reason);
                e.stopPropagation();
                e.preventDefault();
                return;
            }
        });
        APP.isUpdateDOMFirstRunRouting = !!isUpdateDOMFirstRunRouting;
        api.initV2(APP_CONFIG.API_ENDPOINT, API, RESPONSE_STATUS);
        Route.init(APP);
    }
};