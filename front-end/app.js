import {
    UI
} from '/mindmap/ui.js';
import {
    DATA
} from '/mindmap/data.js';
import {
    Route
} from '/mindmap/route.js';
import {
    GOOGLE,
    RESPONSE_STATUS,
    API
} from '/mindmap/config.js';
import {
    api
} from '/mindmap/service/api.v2.js';

// double tap node will trigger `double-tap-node` event
export const APP = {
    GoogleAuth: null,
    run: (preloadLibs) => {
        try {
            api.init(API, RESPONSE_STATUS);
            Route.init(APP);
        } catch (error) {
            console.log(error);
        }
    }
}