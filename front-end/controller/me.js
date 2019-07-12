import {
    Toaster
} from '/mindmap/service/toaster.js';

import {
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