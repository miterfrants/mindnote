import {
    api
} from '/mindnote/service/api.v2.js';

import {
    Cyto
} from '/mindnote/controller/cyto.js';

import {
    RESPONSE_STATUS
} from '/mindnote/config.js';

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
        this.bindEvent();
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

        this.nodes = respForNodes.data;
        this.relationship = respForRelationship.data;
    }

    async postRender() {
        const container = UI.getCytoContainer();
        this.cy = Cyto.init(container, this.nodes, this.relationship, false);

        const haveLearnedTipDoubleTap = localStorage.getItem('have_learned_tip_double_tap') === 'true';
        if (this.nodes.length > 0 && !haveLearnedTipDoubleTap) {
            this.showTip();
        }
    }

    bindEvent() {
        document.addEventListener('double-tap-node', (e) => {
            const title = e.detail.title;
            const desc = e.detail.description;
            UI.openNodeWindow(title, desc);
            localStorage.setItem('have_learned_tip_double_tap', 'true');
            clearTimeout(this.timerForTip);
        });
        document.querySelector('.btn-layout').addEventListener('click', () => {
            UI.Cyto.reArrange(this.cy);
        });
    }

    showTip() {
        this.timerForTip = setTimeout(() => {
            Toaster.popup(MINDNOTE_ERROR_TYPE.INFO, '小提示: 如果需要看詳細內容，請對藍色圈圈連點兩次', 5000);
            this.showTip();
        }, this.showTipCountDownDuration);
        this.showTipCountDownDuration *= 3;
    }
}