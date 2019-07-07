import {
    UI
} from '/mindmap/ui.js';

import {
    GOOGLE,
    API,
    RESPONSE_STATUS
} from '/mindmap/config.js';

import {
    api
} from '/mindmap/service/api.v2.js';

import {
    Route
} from '/mindmap/route.js';

import {
    Toaster
} from '/mindmap/service/toaster.js';

import {
    MindmapError,
    MINDMAP_ERROR_TYPE
} from '/mindmap/util/mindmap-error.js';

export class Me {
    constructor(args, context) {
        this.init(args, context);
        this.run(args, context);
    }
    // Header
    async init(args, context) {}

    async run(args, context) {
        args.me;
        if (args.me === null || args.me === undefined) {
            Toaster.popup(MINDMAP_ERROR_TYPE.WARN, '此頁面需要登入');
        }
    }
}