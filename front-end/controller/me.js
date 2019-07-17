import {
    Toaster
} from '/mindnote/service/toaster.js';

import {
    MINDNOTE_ERROR_TYPE
} from '/mindnote/util/mindnote-error.js';

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
            Toaster.popup(MINDNOTE_ERROR_TYPE.WARN, '此頁面需要登入');
        }
    }
}