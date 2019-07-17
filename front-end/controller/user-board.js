import {
    UI
} from '/mindnote/ui.js';
import {
    Cyto
} from '/mindnote/controller/cyto.js';
import {
    api
} from '/mindnote/service/api.v2.js';
import {
    RESPONSE_STATUS
} from '/mindnote/config.js';

import {
    MindnoteError,
    MINDNOTE_ERROR_TYPE
} from '/mindnote/util/mindnote-error.js';

import {
    Toaster
} from '/mindnote/service/toaster.js';

import {
    MindnoteFileReader
} from '/mindnote/service/filereader.js';

import {
    Image
} from '/mindnote/service/image.js';

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
        this.deletedMode = false;
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
            UI.switchToNormalMode();
            UI.Cyto.switchToNormalMode(this.cy);
            UI.header.generateNavigation([{
                title: '我的分類',
                link: '/mindnote/users/me/boards/'
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
        const elController = document.querySelector('.router-user-board');
        const elNodeForm = elController.querySelector('.node-form');
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
        document.querySelector('.btn-layout').addEventListener('click', (e) => {
            if (e.currentTarget.classExists('disabled')) {
                return;
            }
            this.cy.trigger('re-arrange');
        });
        document.querySelector('.btn-switch-delete-mode').addEventListener('click', (e) => {
            this.deletedMode = !this.deletedMode;
            Cyto.isDisableConnecting = this.deletedMode;
            if (this.deletedMode) {
                const haveShownTip = localStorage.getItem('tip_of_delete_mode');
                if (haveShownTip !== 'true') {
                    Toaster.popup(MINDNOTE_ERROR_TYPE.INFO, '小提示: <br/> 1. 點選「藍線」或是「藍圈圈」，呈半透明狀態 <br/> 2. 確認後按下左上方的橘黃色按鈕「刪除資料」就完成囉～', 15000);
                    localStorage.setItem('tip_of_delete_mode', 'true');
                }
                UI.switchToDeleteMode();
                UI.Cyto.switchToDeleteMode(this.cy);
            } else {
                UI.switchToNormalMode();
                UI.Cyto.switchToNormalMode(this.cy);
            }
        });
        document.querySelector('.btn-delete-change').addEventListener('click', async (e) => {
            const nodeIds = this.cy.$('node.deleting').map((node) => {
                return node.data('id').replace('node-', '');
            });

            const relationshipIds = this.cy.$('edge.deleting').map((edge) => {
                return edge.data('id').replace('edge-', '');
            });
            if (nodeIds.length > 0) {
                const respForDeleteNode = await api.authApiService.nodes.delete({
                    token: this.token,
                    boardId: this.boardId,
                    nodeIds,
                });
                if (respForDeleteNode.status === RESPONSE_STATUS.OK) {
                    if (respForDeleteNode.data !== nodeIds.length && respForDeleteNode.data.length > 0) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, "部份刪除失敗");
                    } else if (respForDeleteNode.data === 0) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, "刪除失敗");
                    } else {
                        this.cy.$('node.deleting').remove();
                    }
                } else {
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, respForDeleteNode.data.errorMsg);
                }
            }

            if (relationshipIds.length > 0) {
                const respForDeleteRelationship = await api.authApiService.relationship.delete({
                    token: this.token,
                    boardId: this.boardId,
                    relationshipIds,
                });

                if (respForDeleteRelationship.status === RESPONSE_STATUS.OK) {
                    if (respForDeleteRelationship.data !== nodeIds.length && respForDeleteRelationship.data.length > 0) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, "部份刪除失敗");
                    } else if (respForDeleteRelationship.data === 0) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, "刪除失敗");
                    } else {
                        this.cy.$('edge.deleting').remove();
                    }
                } else {
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, respForDeleteRelationship.data.errorMsg);
                }
            }
            this.deletedMode = !this.deletedMode;
            Cyto.isDisableConnecting = this.deletedMode;
            UI.switchToNormalMode();
            UI.Cyto.switchToNormalMode(this.cy);
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
            } else if (resp.httpStatus === 417) {
                e.detail.edgeInstance.remove();
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
            } else {
                e.detail.edgeInstance.remove();
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
            }
        });
        document.addEventListener('create-node-done', UI.hideNodeForm);
        document.addEventListener('update-node-done', UI.hideNodeForm);
        document.addEventListener('tap-canvas', (e) => {
            if (this.deletedMode) {
                return;
            }
            const position = {
                x: e.detail.position.x,
                y: e.detail.position.y
            }
            UI.showNodeForm(this.cy, '', '', '', position);
        });
        document.addEventListener('double-tap-node', (e) => {
            if (this.deletedMode) {
                return;
            }
            const title = e.detail.title;
            const desc = e.detail.description;
            UI.openNodeWindow(title, desc)
        });
        document.addEventListener('tap-node', (e) => {
            if (this.deletedMode) {
                if (e.detail.node.hasClass('deleting')) {
                    const sourseEdges = this.cy.$(`edge[source="${e.detail.node.data('id')}"]`);
                    const targetEdges = this.cy.$(`edge[target="${e.detail.node.data('id')}"]`);
                    e.detail.node.removeClass('deleting');
                    // 檢查 edge 是否有一個 node 是刪除的
                    // 檢查 target
                    for (let i = 0; i < sourseEdges.length; i++) {
                        if (this.cy.$(`node#${sourseEdges[i].data('target')}`).hasClass('deleting')) {
                            continue;
                        }
                        sourseEdges[i].removeClass('deleting');
                    }
                    // 檢查 source
                    for (let i = 0; i < targetEdges.length; i++) {
                        if (this.cy.$(`node#${targetEdges[i].data('source')}`).hasClass('deleting')) {
                            continue;
                        }
                        targetEdges[i].removeClass('deleting');
                    }

                } else {
                    this.cy.$(`edge[source="${e.detail.node.data('id')}"]`).addClass('deleting');
                    this.cy.$(`edge[target="${e.detail.node.data('id')}"]`).addClass('deleting');
                    e.detail.node.addClass('deleting');
                }
                return;
            }
            const position = {
                x: e.detail.position.x,
                y: e.detail.position.y
            }
            UI.showNodeForm(this.cy, e.detail.title, e.detail.description, e.detail.id, position);
        });

        document.addEventListener('tap-edge', (e) => {
            if (this.deletedMode) {
                if (e.detail.edge.hasClass('deleting')) {
                    e.detail.edge.removeClass('deleting');
                } else {
                    e.detail.edge.addClass('deleting');
                }
                return;
            }
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
            if (e.currentTarget.classExists('disabled')) {
                return;
            }
            const button = e.currentTarget;
            const tempElement = document.createElement('textarea');
            tempElement.value = `${location.origin}/mindnote/boards/${this.board.id }/`;
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

        // drag and drop event
        document.addEventListener('dragenter', (e) => {
            if (elNodeForm.classExists('hide')) {
                return;
            }
            UI.nodeForm.dragStart();
            e.stopPropagation();
            e.preventDefault();
        });
        document.addEventListener('dragleave', UI.nodeForm.resetDragDropState);
        document.addEventListener('dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
        document.addEventListener('drop', (e) => {
            UI.nodeForm.resetDragDropState();
            e.stopPropagation();
            e.preventDefault();
        });

        elNodeForm.addEventListener('dragenter', (e) => {
            UI.nodeForm.dragEnterDetail();
            e.stopPropagation();
            e.preventDefault();
        });
        elNodeForm.addEventListener('dragleave', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });

        elNodeForm.querySelector('.drop-to-upload-cover')
            .addEventListener('dragenter', UI.nodeForm.dragEnterUploadCover);
        elNodeForm.querySelector('.drop-to-upload-cover')
            .addEventListener('dragleave', UI.nodeForm.dragLeaveUploadCover);
        elNodeForm.querySelector('.drop-to-upload-description')
            .addEventListener('dragenter', UI.nodeForm.dragEnterUploadDescriptionImage);
        elNodeForm.querySelector('.drop-to-upload-description')
            .addEventListener('dragleave', UI.nodeForm.dragLeaveUploadDescriptionImage);


        elNodeForm.querySelector('.drop-to-upload-description').addEventListener('drop', async (e) => {
            const files = e.dataTransfer.files;
            const elNodeForm = document.querySelector('.node-form');
            const elNodeDescriptoin = document.querySelector('.node-form #node-description');
            let nodeDescription = elNodeDescriptoin.value;
            const nodeId = Number(elNodeForm.querySelector('.node-id').value.replace(/node\-/gi, ''));
            const base64Files = await MindnoteFileReader.readFilesToBase64(files);
            for (let i = 0; i < base64Files.length; i++) {
                const injectResult = injectFlag(nodeDescription, elNodeDescriptoin.selectionStart, elNodeDescriptoin.selectionEnd);
                nodeDescription = injectResult.content;
                base64Files[i].clientSideFlagId = injectResult.flagId;
                base64Files[i].nodeId = nodeId;
            }
            elNodeDescriptoin.value = nodeDescription

            const resp = await api.authApiService.images.post({
                base64Files,
                token: this.token,
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                let nodeDescription = elNodeDescriptoin.value;
                for (var i = 0; i < resp.data.length; i++) {
                    nodeDescription = nodeDescription.replace(
                        `![#${resp.data[i].clientSideFlagId} Uploading Image Title](Uploading Image URL)`,
                        `![#${resp.data[i].filename}](${Image.generateImageUrl(resp.data[i].filename)})`
                    );
                }
                const lastData = resp.data[resp.data.length - 1];
                elNodeDescriptoin.value = nodeDescription;
            } else {
                //fix: errorMsg 改成 data.message
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
            }

            function injectFlag(content, start, end) {
                const flagId = guidGenerator();
                const result = [
                    content.substring(0, start),
                    '\r',
                    `![#${flagId} Uploading Image Title](Uploading Image URL)`,
                    '\r',
                    nodeDescription.substring(end)
                ]
                return {
                    flagId,
                    content: result.join('')
                };
            }

            function guidGenerator() {
                var S4 = function () {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                };
                return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
            }

            UI.nodeForm.resetDragDropState();
            e.stopPropagation();
            e.preventDefault();
        });
        elNodeForm.querySelector('.drop-to-upload-cover').addEventListener('drop', async (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 1) {
                Toaster.popup(MINDNOTE_ERROR_TYPE.WARN, '封面只有一張，請謹慎挑選');
                return;
            }
            const elNodeForm = document.querySelector('.node-form');
            const nodeId = Number(elNodeForm.querySelector('.node-id').value.replace(/node\-/gi, ''));
            const fileData = await MindnoteFileReader.readFileToBase64(files[0]);
            const respForUploadImage = await api.authApiService.images.post({
                base64Files: [{
                    ...fileData,
                    nodeId
                }],
                token: this.token,
            });
            if (respForUploadImage.status === RESPONSE_STATUS.OK) {
                const data = respForUploadImage.data[0];
                UI.Cyto.updateBackgroundImage(this.cy, nodeId, Image.generateImageUrl(data.filename, 200));
                const respForUpdateNode = await api.authApiService.node.patch({
                    cover: data.filename,
                    token: this.token,
                    boardId: this.boardId,
                    nodeId,
                });

                if (respForUpdateNode.status === RESPONSE_STATUS.OK) {
                    Toaster.popup(MINDNOTE_ERROR_TYPE.INFO, '筆記封面已經更新囉');
                } else {
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, respForUpdateNode.data.errorMsg);
                }

            } else {
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, respForUploadImage.data.errorMsg);
            }
            UI.nodeForm.resetDragDropState();
            e.stopPropagation();
            e.preventDefault();
        });
    }
}