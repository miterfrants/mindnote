import {
    RouterController
} from '/mindnote/route/router-controller.js';
import {
    api
} from '/mindnote/service/api.v2.js';
import {
    RESPONSE_STATUS
} from '/mindnote/constants.js';
import {
    MindnoteError
} from '/mindnote/util/mindnote-error.js';
import {
    UI
} from '/mindnote/ui.js';
import {
    markdownit
} from '/mindnote/third-party/markdow-it/mdit.min.js';
import {
    Swissknife
} from '/mindnote/service/swissknife.js';
import {
    ImageService
} from '/mindnote/service/image.js';

export class Node extends RouterController {
    constructor(elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.node = null;
        this.board = null;
    }
    async enter(args) {
        super.enter(args);
        this.node = null;
        this.board = null;
    }
    async render(withoutCache) {
        super.render();
        this.node = await this._getTargetNode(withoutCache);
        this.board = await this._getTargetBoard(withoutCache);
        this.elHTML.querySelector('.title').innerHTML = this.node.title;
        this.elHTML.querySelector('.content').innerHTML = markdownit().render(this.node.description);
        UI.header.generateNavigation([{
            title: this.board.title,
            link: `/mindnote/users/me/boards/${this.args.boardId}/`
        }, {
            title: this.node.title
        }]);
        if (Swissknife.getQueryString('hide-header') === 'true') {
            document.querySelector('.header').addClass('hide');
        } else {
            document.querySelector('.header').removeClass('hide');
        }

        let title = '';
        if (this.board.username) {
            title = this.node.title + ' - ' + this.board.title + ' - ' + this.board.username;
        } else {
            title = this.node.title + ' - ' + this.board.title
        }

        let metaData = {
            title
        };
        if (this.node.cover) {
            metaData.image = ImageService.generateImageUrl(this.node.cover, 1000);
        }

        UI.header.setMetaData(metaData);
    }

    async _getTargetNode(withoutCache) {
        const filterNode = this.args.nodes ? this.args.nodes.filter((node) => {
            return node.id === this.args.nodeId;
        }) : [];
        if (filterNode.length > 0) {
            return filterNode[0];
        } else {
            const resp = await api.authApiService.node.get({
                boardId: this.args.boardId,
                nodeId: this.args.nodeId,
                token: this.args.token
            }, null, withoutCache);
            if (resp.status === RESPONSE_STATUS.FAILED) {
                if (resp.httpStatus === 417) {
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
                } else {
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
                }
            }
            return resp.data;
        }
    }

    async _getTargetBoard(withoutCache) {
        const resp = await api.authApiService.board.get({
            boardId: this.args.boardId,
            token: this.args.token
        }, null, withoutCache);
        if (resp.status === RESPONSE_STATUS.FAILED) {
            if (resp.httpStatus === 417) {
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
            } else {
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
            }
        }
        return resp.data;
    }
}