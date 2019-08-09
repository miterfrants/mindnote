import {
    api
} from '/mindnote/service/api.v2.js';

import {
    Cyto
} from '/mindnote/controller/cyto.js';

import {
    RESPONSE_STATUS
} from '/mindnote/constants.js';

import {
    UI
} from '/mindnote/ui.js';

import {
    MindnoteError,
    MINDNOTE_ERROR_TYPE
} from '/mindnote/util/mindnote-error.js';

import {
    Toaster
} from '/mindnote/service/toaster.js';

import {
    RouterController
} from '/mindnote/route/router-controller.js';
import {
    ImageService
} from '/mindnote/service/image.js';

export class Board extends RouterController {
    constructor(elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.cy = null;
        this.nodes = [];
        this.relationship = [];
        this.timerForTip;
        this.showTipCountDownDuration = 6000;
    }

    async init() {
        this._bindEvent();
    }

    async enter(args) {
        super.enter(args);
    }

    async render(withoutCache) {
        super.render(withoutCache);

        const respForBoard = (await api.apiService.board.get({
            boardId: this.args.boardId
        }));

        if (respForBoard.status !== RESPONSE_STATUS.OK) {
            throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, respForBoard.data.errorMsg);
        }

        UI.header.generateNavigation([{
            title: respForBoard.data.title
        }]);

        // set metadata
        UI.header.setMetaData({
            title: respForBoard.data.username ? respForBoard.data.title + ' - ' + respForBoard.data.username : respForBoard.data.title,
            image: ImageService.generateImageUrl(respForBoard.data.filename, 1000)
        });
    }

    async postRender() {
        const respForNodes = (await api.apiService.nodes.get({
            boardId: this.args.boardId
        }));

        if (respForNodes.status !== RESPONSE_STATUS.OK) {
            throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, respForNodes.data.errorMsg);
        }

        const respForRelationship = (await api.apiService.relationship.get({
            boardId: this.args.boardId
        }));

        if (respForRelationship.status !== RESPONSE_STATUS.OK) {
            throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, respForRelationship.data.errorMsg);
        }

        const nodes = respForNodes.data;
        const relationship = respForRelationship.data;

        const container = UI.getCytoContainer();
        this.cy = Cyto.init(container, nodes, relationship, false);

        const haveLearnedTipDoubleTap = localStorage.getItem('have_learned_tip_double_tap') === 'true';
        if (this.nodes.length > 0 && !haveLearnedTipDoubleTap) {
            this._showTip();
        }
    }

    _bindEvent() {
        document.addEventListener('double-tap-node', (e) => {
            UI.openNodeWindow(this.args.boardId, e.detail.id, false);
            localStorage.setItem('have_learned_tip_double_tap', 'true');
            clearTimeout(this.timerForTip);
        });
        this.elHTML.querySelector('.btn-layout').addEventListener('click', () => {
            UI.Cyto.reArrange(this.cy);
        });
    }

    _showTip() {
        this.timerForTip = setTimeout(() => {
            Toaster.popup(MINDNOTE_ERROR_TYPE.INFO, '小提示: 如果需要看詳細內容，請對藍色圈圈連點兩次', 5000);
            this.showTip();
        }, this.showTipCountDownDuration);
        this.showTipCountDownDuration *= 3;
    }
}