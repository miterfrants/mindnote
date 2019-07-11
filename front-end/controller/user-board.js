import {
    UI
} from '/mindmap/ui.js';
import {
    Cyto
} from '/mindmap/controller/cyto.js';
import {
    api
} from '/mindmap/service/api.v2.js';
import {
    RESPONSE_STATUS
} from '/mindmap/config.js';

import {
    MindmapError,
    MINDMAP_ERROR_TYPE
} from '/mindmap/util/mindmap-error.js';

window['MindmapRoutingLocation'] = [];
window['MindmapContinueDeleteCount'] = 0;
window['MindmapContinueDeleteTimer'];

export class UserBoard {
    constructor(args, context) {
        this.init(args, context);
        this.run(args, context);
    }
    async init(args, context) {
        this.cy = null;
        this._bindEvent();
    }
    async run(args, context) {
        this.token = args.token;
        this.boardId = args.boardId;
        this.board;
        if (this.token) {
            if (this.cy) {
                this.cy.destroy();
            }
            this.board = (await api.authApiService.board.get({
                boardId: this.boardId,
                token: this.token
            })).data;
            const nodes = (await api.authApiService.nodes.get({
                boardId: this.boardId,
                token: this.token
            })).data
            const relationship = (await api.authApiService.relationship.get({
                boardId: this.boardId,
                token: this.token
            })).data;

            const container = UI.getCytoEditContainer();
            this.cy = Cyto.init(container, nodes, relationship, true);
            UI.header.generateNavigation([{
                title: '我的分類',
                link: '/mindmap/users/me/boards/'
            }, {
                title: this.board.title
            }]);
            UI.showAuth();
            UI.hideNodeForm();
        } else {
            UI.hideAuth();
            if (this.cy) {
                this.cy.destroy();
            }
        }
    }

    _bindEvent() {
        document.querySelector('.btn-add').addEventListener('click', async (e) => {
            const title = document.querySelector('.title').value;
            const description = document.querySelector('.description').value;
            const token = localStorage.getItem('token');

            this.cy.trigger('createNode', [
                title,
                description
            ]);

            const resp = await api.authApiService.nodes.post({
                title,
                description,
                token,
                boardId: this.boardId
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                this.cy.trigger('createNodeDone', [
                    resp.data
                ]);
                UI.hideNodeForm();
            }
        });
        document.querySelector('.btn-update').addEventListener('click', async (e) => {
            const title = document.querySelector('.title').value;
            const description = document.querySelector('.description').value;
            if (description.indexOf('Uploading Image URL') !== -1) {
                if (!confirm('檔案還沒傳完，你確定要更新現有資料嗎？')) {
                    return;
                }
            }
            const nodeId = document.querySelector('.node-id').value.replace(/node\-/gi, '');
            const resp = await api.authApiService.node.patch({
                title,
                description,
                token: this.token,
                boardId: this.boardId,
                nodeId
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                this.cy.trigger('updateNodeDone', [
                    resp.data
                ]);
                UI.hideNodeForm();
            }
        });
        document.querySelector('.btn-node-delete').addEventListener('click', async (e) => {
            // 連續刪除超過兩次，就不跳 prompt 請使用者輸入
            var result = 'DELETE'

            if (window.MindmapContinueDeleteCount <= 2) {
                result = prompt('如果需要刪除，請輸入 "DELETE"');
            } else {
                clearTimeout(window.MindmapContinueDeleteTimer);
            }

            window.MindmapContinueDeleteCount += 1;
            window.MindmapContinueDeleteTimer = setTimeout(() => {
                window.MindmapContinueDeleteCount = 0;
            }, 120 * 1000);

            if (result === 'DELETE') {
                const nodeId = document.querySelector('.node-id').value.replace(/node\-/gi, '');
                const resp = await api.authApiService.node.delete({
                    token: this.token,
                    boardId: this.boardId,
                    nodeId
                });

                if (resp.status === RESPONSE_STATUS.OK) {
                    this.cy.trigger('deleteNodeDone', [{
                        id: nodeId
                    }]);
                    UI.hideNodeForm();
                }
            } else {
                alert('輸入文字不吻合');
            }
        });
        document.querySelector('.btn-layout').addEventListener('click', () => {
            this.cy.trigger('re-arrange');
        });
        document.querySelector('.btn-close').addEventListener('click', UI.hideNodeForm);
        document.querySelector('.mask').addEventListener('click', UI.hideNodeForm);

        document.addEventListener('save-edge', async (e) => {
            const resp = await api.authApiService.relationship.post({
                parent_node_id: e.detail.parent_node_id.replace(/node\-/gi, ''),
                child_node_id: e.detail.child_node_id.replace(/node\-/gi, ''),
                token: this.token,
                boardId: this.boardId
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                this.cy.trigger('saveEdgeDone', [{
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
            UI.showNodeForm(this.cy, '', '', '', position);
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
            UI.showNodeForm(this.cy, e.detail.title, e.detail.description, e.detail.id, position);
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
        document.querySelectorAll('.node-form .title').forEach((el) => {
            el.addEventListener('keyup', (e) => {
                const nodeId = document.querySelector('.node-id').value.replace(/node\-/gi, '');
                if (e.currentTarget.value === '') {
                    e.currentTarget.dataset['isComposing'] = false;
                } else {
                    const isComposing = e.currentTarget.dataset['isComposing'] === 'true';
                    if (e.keyCode === 13 && isComposing === false) {
                        if (nodeId === '') {
                            document.querySelector('.btn-add').click();
                        } else {
                            document.querySelector('.btn-update').click();
                        }
                    }
                    if (e.isComposing) {
                        e.currentTarget.dataset['isComposing'] = true;
                    } else {
                        e.currentTarget.dataset['isComposing'] = false;
                    }
                }
                e.stopPropagation();
                e.preventDefault();
                return;
            });
        });
        document.querySelector('.btn-copy-shared-link').addEventListener('click', (e) => {
            const button = e.currentTarget;
            const tempElement = document.createElement('textarea');
            tempElement.value = `${location.origin}/mindmap/boards/${this.board.id }/`;
            tempElement.style.opacity = 0;
            tempElement.style.position = 'fixed';
            tempElement.style.top = 0;
            document.body.appendChild(tempElement);
            tempElement.select();
            document.execCommand("copy");
            document.body.removeChild(tempElement);
            button.querySelector('span').innerHTML = '已複製'
            button.addClass('copied');
            setTimeout(() => {
                button.querySelector('span').innerHTML = '複製公開連結'
                button.removeClass('copied');
            }, 3000)
        });
        document.addEventListener('dropdown-node', (e) => {
            api.authApiService.node.patch({
                token: this.token,
                boardId: this.boardId,
                nodeId: e.detail.nodeId,
                x: e.detail.position.x,
                y: e.detail.position.y
            });
        });
        document.addEventListener('layout-done', (e) => {
            api.authApiService.nodes.patch({
                token: this.token,
                boardId: this.boardId,
                nodes: e.detail.nodes
            });
        });

        document.body.addEventListener('dragenter', (e) => {
            if (document.querySelector('.node-form').classExists('hide')) {
                return;
            }
            document.querySelector('.node-form .drag-overlay').removeClass('hide');
            e.stopPropagation();
            e.preventDefault();
        });

        document.querySelector('.node-form').addEventListener('dragenter', (e) => {
            if (document.querySelector('.node-form').classExists('hide')) {
                return;
            }
            document.querySelector('.node-form .drag-overlay').removeClass('hide');
            e.stopPropagation();
            e.preventDefault();
        });

        document.addEventListener('dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
            return;
        });

        document.querySelector('.node-form .drag-overlay').addEventListener('drop', async (e) => {
            const files = e.dataTransfer.files;
            const elNodeForm = document.querySelector('.node-form');
            const nodeId = Number(elNodeForm.querySelector('.node-id').value.replace(/node\-/gi, ''));

            const base64Files = await new Promise((resolve, reject) => {
                let loadImageCount = 0;
                const _base64Files = [];
                for (var i = 0; i < files.length; i++) {
                    const tempId = insertTempTag();
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(files[i]);
                    fileReader.addEventListener('loadend', (e) => {
                        loadImageCount += 1;
                        if (loadImageCount === files.length) {
                            resolve(_base64Files);
                        }
                        const imageResult = e.currentTarget.result.replace('data:', '');
                        const contentType = imageResult.substring(0, imageResult.indexOf('base64,'));
                        _base64Files.push({
                            data: imageResult.replace(contentType, '').replace('base64,', ''),
                            contentType: contentType.replace(';', ''),
                            tempId,
                            nodeId
                        });
                    });
                }
            });

            const resp = await api.authApiService.images.post({
                base64Files,
                token: this.token,
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                const elNodeDescriptoin = document.querySelector('.node-form #node-description');
                let nodeDescription = elNodeDescriptoin.value;
                for (var i = 0; i < resp.data.length; i++) {
                    nodeDescription = nodeDescription.replace(
                        `![#${resp.data[i].tempId} Uploading Image Title](Uploading Image URL)`,
                        `![#${resp.data[i].newId}](https://sapiens-tools-mindmap.imgix.net/${resp.data[i].newId})`
                    );
                }
                const lastData = resp.data[resp.data.length - 1];
                this.cy.$(`#node-${lastData.nodeId}`).style('background-image', `https://sapiens-tools-mindmap.imgix.net/${lastData.newId}`);
                elNodeDescriptoin.value = nodeDescription;
            } else {
                //fix: errorMsg 改成 data.message
                throw new MindmapError(MINDMAP_ERROR_TYPE.ERROR, resp.data.errorMsg);
            }

            function insertTempTag() {
                const elNodeDescriptoin = document.querySelector('.node-form #node-description');
                const nodeDescription = elNodeDescriptoin.value;
                const tempImageId = guidGenerator();
                const result = [
                    nodeDescription.substring(0, elNodeDescriptoin.selectionStart),
                    '\r',
                    `![#${tempImageId} Uploading Image Title](Uploading Image URL)`,
                    '\r',
                    nodeDescription.substring(elNodeDescriptoin.selectionEnd)
                ]
                document.querySelector('.node-form #node-description').value = result.join('');
                return tempImageId;
            }

            function guidGenerator() {
                var S4 = function () {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                };
                return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
            }

            document.querySelector('.node-form .drag-overlay').addClass('hide');
            e.stopPropagation();
            e.preventDefault();
            return;
        })

        document.addEventListener('drop', (e) => {
            document.querySelector('.node-form .drag-overlay').addClass('hide');
            e.stopPropagation();
            e.preventDefault();
            return;
        })
    }
}