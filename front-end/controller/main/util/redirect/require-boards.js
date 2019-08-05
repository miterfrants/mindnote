import {
    RouterController
} from '/mindnote/route/router-controller.js';

import {
    RESPONSE_STATUS
} from '/mindnote/constants.js';

import {
    api
} from '/mindnote/service/api.v2.js';

import {
    MINDNOTE_ERROR_TYPE,
    MindnoteError
} from '/mindnote/util/mindnote-error.js';

export class RequireBoards extends RouterController {
    async enter(args) {
        super.enter(args);
        const resp = await api.authApiService.boards.get({
            token: this.args.token
        });

        if (resp.status === RESPONSE_STATUS.OK) {
            history.replaceState({}, '', `/mindnote/users/me/boards/${resp.data[0].id}/?action=tutorial`);
        } else if (resp.status === RESPONSE_STATUS.FAILED) {
            if (resp.httpStatus === 417) {
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
            } else {
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
            }
        }
    }
}