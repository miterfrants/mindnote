import {
    Route
} from '/mindmap/route.js';
import {
    RESPONSE_STATUS,
    API
} from '/mindmap/config.js';
import {
    api
} from '/mindmap/service/api.v2.js';

// double tap node will trigger `double-tap-node` event
export const APP = {
    GoogleAuth: null,
    run: () => {
        api.init(API, RESPONSE_STATUS);
        Route.init(APP);
    }
}