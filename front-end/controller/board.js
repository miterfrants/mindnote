import {
    api
} from '/mindmap/service/api.v2.js';
import {
    Cyto
} from '/mindmap/controller/cyto.js';
import {
    API,
    RESPONSE_STATUS
} from '/mindmap/config.js';
import {
    UI
} from '/mindmap/ui.js';

import {
    MindmapError,
    MINDMAP_ERROR_TYPE
} from '/mindmap/util/mindmap-error.js';

export class Board {
    constructor(args, context) {
        this.init(args, context);
        this.run(args, context);
    }
    async init(args, context) {
        this.cy = null;
        this._bindEvent();
    }
    async run(args, context) {
        this.username = args.username;
        this.token = args.token;
        this.boardId = args.boardId;
        this.args = args;
        this.context = context;

        UI.header.generateNavigation([{
            title: 'Boards',
            link: '/mindmap/users/me/boards/'
        }]);

        api.init(API, RESPONSE_STATUS);
        const respForNodes = (await api.apiService.nodes.get({
            boardId: this.boardId,
            token: this.token
        }));

        if (respForNodes.status !== RESPONSE_STATUS.OK) {
            throw new MindmapError(MINDMAP_ERROR_TYPE.ERROR, respForNodes.data.errorMsg);
        }

        const respForRelationship = (await api.apiService.relationship.get({
            boardId: this.boardId,
            token: this.token
        }));

        if (respForRelationship.status !== RESPONSE_STATUS.OK) {
            throw new MindmapError(MINDMAP_ERROR_TYPE.ERROR, respForRelationship.data.errorMsg);
        }

        const nodes = respForNodes.data;
        const relationship = respForRelationship.data;

        const container = UI.getCytoContainer();
        this.cy = Cyto.init(container, nodes, relationship, false);

    }

    _bindEvent() {
        document.addEventListener('double-tap-node', (e) => {
            const title = e.detail.title;
            const desc = e.detail.description;
            UI.openNodeWindow(title, desc)
        });
        document.querySelector('.btn-layout').addEventListener('click', () => {
            UI.Cyto.reArrange(this.cy);
        });
    }
}