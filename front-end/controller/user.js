import {
    UI
} from '/mindmap/ui.js';
import {
    Cyto
} from '/mindmap/controller/cyto.js';
import {
    authApiService
} from '/mindmap/service/api.js';
import {
    API,
    RESPONSE_STATUS
} from '/mindmap/config.js';
export const User = function (args) {
    // User
    let cy = null;
    const username = args.username;
    const token = args.token;
    const boardUniquename = args.boardUniquename;
    const init = async () => {
        if (token) {
            authApiService.init(API, RESPONSE_STATUS);
            const nodes = (await authApiService.nodes.get({
                username,
                boardUniquename,
                token
            })).data
            const relationship = (await authApiService.relationship.get({
                username,
                boardUniquename,
                token
            })).data;
            const container = UI.getCytoContainer();
            User.cy = Cyto.init(container, nodes, relationship, true);
            _bindEvent();
            UI.showAuth();
        } else {
            UI.hideAuth();
            if (User.cy) {
                User.cy.destroy();
            }
        }
    }

    const _bindEvent = () => {
        document.querySelector('.btn-add').addEventListener('click', async (e) => {
            const title = document.querySelector('.title').value;
            const description = document.querySelector('.description').value;
            const token = localStorage.getItem('token');

            User.cy.trigger('createNode', [
                title,
                description
            ]);

            const resp = await authApiService.nodes.post({
                title,
                description,
                token,
                username,
                selectedBoard: {
                    uniquename: boardUniquename
                }
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                User.cy.trigger('createNodeDone', [
                    resp.data
                ]);
                UI.hideNodeForm();
            }
        });
        document.querySelector('.btn-update').addEventListener('click', async (e) => {
            const title = document.querySelector('.title').value;
            const description = document.querySelector('.description').value;
            const nodeId = document.querySelector('.node-id').value;
            const token = localStorage.getItem('token');
            const resp = await authApiService.node.patch({
                title,
                description,
                token,
                username,
                boardUniquename,
                nodeId
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                User.cy.trigger('updateNodeDone', [
                    resp.data
                ]);
                UI.hideNodeForm();
            }
        });
        document.querySelector('.btn-layout').addEventListener('click', () => {
            UI.Cyto.reArrange(User.cy);
        });
        document.querySelector('.btn-close').addEventListener('click', UI.hideNodeForm);
        document.querySelector('.mask').addEventListener('click', UI.hideNodeForm);

        document.addEventListener('save-edge', async (e) => {
            const token = localStorage.getItem('token');
            const resp = await authApiService.relationship.post({
                parent_node_id: e.detail.parent_node_id.replace(/node\-/gi, ''),
                child_node_id: e.detail.child_node_id.replace(/node\-/gi, ''),
                token,
                username,
                boardUniquename
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                User.cy.trigger('saveEdgeDone', [{
                    ...resp.data,
                    edgeInstance: e.detail.edgeInstance
                }]);
            }
        });
        document.addEventListener('create-node-done', UI.hideNodeForm);
        document.addEventListener('update-node-done', UI.hideNodeForm);
        document.addEventListener('tap-canvas', (e) => {
            const position = {
                x: e.detail.position.x,
                y: e.detail.position.y
            }
            UI.showNodeForm(User.cy, '', '', '', position);
        });
        document.addEventListener('double-tap-node', (e) => {
            const title = e.detail.title;
            const desc = e.detail.description;
            UI.openNodeWindow(title, desc)
        });
        document.addEventListener('tap-node', (e) => {
            const position = {
                x: e.detail.position.x,
                y: e.detail.position.y
            }
            UI.showNodeForm(User.cy, e.detail.title, e.detail.description, e.detail.id, position);
        });
        document.addEventListener('keyup', (e) => {
            // esc
            if (
                e.keyCode === 27 &&
                document.querySelector('.node-form').className.split(' ').indexOf('hide') === -1
            ) {
                UI.hideNodeForm();
            }
        });
    }
    init();
}