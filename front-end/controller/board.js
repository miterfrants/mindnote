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
        this.boardUniquename = args.boardUniquename;
        this.args = args;
        this.context = context;
        api.init(API, RESPONSE_STATUS);
        const nodes = (await api.apiService.nodes.get({
            boardUniquename: this.boardUniquename,
            token: this.token
        })).data
        const relationship = (await api.apiService.relationship.get({
            boardUniquename: this.boardUniquename,
            token: this.token
        })).data;
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