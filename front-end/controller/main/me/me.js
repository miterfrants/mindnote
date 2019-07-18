import {
    Toaster
} from '/mindnote/service/toaster.js';

import {
    MINDNOTE_ERROR_TYPE
} from '/mindnote/util/mindnote-error.js';

import {
    RouterController
} from '/mindnote/route/router-controller.js';

export class Me extends RouterController {
    async enter(args) {
        super.enter(args);
        if (this.args.me === null || this.args.me === undefined) {
            Toaster.popup(MINDNOTE_ERROR_TYPE.WARN, '此頁面需要登入');
        }
    }
}