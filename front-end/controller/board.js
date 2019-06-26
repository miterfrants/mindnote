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
export const Board = (args) => {
    let cy = null;
    const username = args.username;
    const token = args.token;
    const boardUniquename = args.boardUniquename;
    const init = async () => {
        api.init(API, RESPONSE_STATUS);
        const nodes = (await api.apiService.nodes.get({
            username,
            boardUniquename,
            token
        })).data
        const relationship = (await api.apiService.relationship.get({
            username,
            boardUniquename,
            token
        })).data;
        const container = UI.getCytoContainer();
        Board.cy = Cyto.init(container, nodes, relationship, false);
        _bindEvent();
    }

    const _bindEvent = () => {
        document.addEventListener('double-tap-node', (e) => {
            const title = e.detail.title;
            const desc = e.detail.description;
            UI.openNodeWindow(title, desc)
        });
        document.querySelector('.btn-layout').addEventListener('click', () => {
            UI.Cyto.reArrange(Board.cy);
        });
    }
    init();
}