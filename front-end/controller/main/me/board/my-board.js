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
} from '/mindnote/constants.js';

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
    ImageService
} from '/mindnote/service/image.js';

import {
    TutorialRouterController
} from '/mindnote/controller/tutorial-router-controller.js';

import {
    Swissknife
} from '/mindnote/service/swissknife.js';

import {
    MyBoardTutorialStepsClass
} from '/mindnote/controller/main/me/board/tutorial-steps.js';

export class MyBoard extends TutorialRouterController {
    constructor(elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.board = null;
        this.deletedMode = false;
        this.cy = null;
    }

    async init() {
        this.bindEvent();
    }

    async enter(args) {
        super.enter(args);
        super.showTutorial(MyBoardTutorialStepsClass, false);
        if (this.cy) {
            this.cy.destroy();
        }
    }

    async render(withoutCache) {
        super.render();
        this.board = (await api.authApiService.board.get({
            boardId: this.args.boardId,
            token: this.args.token
        }, null, withoutCache)).data;

        const nodes = (await api.authApiService.nodes.get({
            boardId: this.args.boardId,
            token: this.args.token
        }, null, withoutCache)).data;
        this.args.nodes = nodes;
        const relationship = (await api.authApiService.relationship.get({
            boardId: this.args.boardId,
            token: this.args.token
        }, null, withoutCache)).data;

        const container = UI.getCytoEditContainer();
        // server side no-need run this
        if (window.cytoscape) {
            this.cy = Cyto.init(container, nodes, relationship, true);
            UI.Cyto.switchToNormalMode(this.cy);
        }
        UI.switchToNormalMode();

        UI.header.generateNavigation([{
            title: '我的分類',
            link: '/mindnote/users/me/boards/'
        }, {
            title: this.board.title
        }]);
        UI.hideNodeForm();
    }

    async exit() {
        super.exit();
        // update board cover
        this._updateCover();
    }

    bindEvent() {
        const elNodeForm = this.elHTML.querySelector('.node-form');
        this.elHTML.querySelector('textarea').addEventListener('keyup', (e) => {
            const detail = window.markdownit().render(e.currentTarget.value);
            this.elHTML.querySelector('.markdown-container').innerHTML = detail;
        });

        this.elHTML.querySelector('.btn-fullscreen').addEventListener('click', () => {
            if (this.elHTML.querySelector('.node-form').classExists('fullscreen')) {
                UI.nodeForm.exitFullscreen(this.elHTML);
            } else {
                const detail = window.markdownit().render(this.elHTML.querySelector('textarea').value);
                this.elHTML.querySelector('.markdown-container').innerHTML = detail;
                UI.nodeForm.enterFullscreen(this.elHTML);
            }
        });

        this.elHTML.querySelector('.btn-add').addEventListener('click', async () => {
            const title = this.elHTML.querySelector('.title').value;
            const description = this.elHTML.querySelector('.description').value;
            const token = localStorage.getItem('token');

            this.cy.trigger('createNode', [
                title,
                description
            ]);

            const resp = await api.authApiService.nodes.post({
                title,
                description,
                token,
                boardId: this.args.boardId
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                this.cy.trigger('createNodeDone', [
                    resp.data
                ]);
                if (Swissknife.Tutorial.isTutorialMode()) {
                    Swissknife.Tutorial.gotoTutorialStep('展開修改筆記表單');
                }
                UI.hideNodeForm();
            }
        });
        this.elHTML.querySelector('.btn-update').addEventListener('click', async () => {
            const title = this.elHTML.querySelector('.title').value;
            const description = this.elHTML.querySelector('.description').value;
            if (description.indexOf('Uploading Image URL') !== -1) {
                if (!confirm('檔案還沒傳完，你確定要更新現有資料嗎？')) {
                    return;
                }
            }
            const nodeId = this.elHTML.querySelector('.node-id').value.replace(/node-/gi, '');
            const resp = await api.authApiService.node.patch({
                title,
                description,
                token: this.args.token,
                boardId: this.args.boardId,
                nodeId
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                this.cy.trigger('updateNodeDone', [
                    resp.data
                ]);
                if (Swissknife.Tutorial.isTutorialMode()) {
                    if (Swissknife.Tutorial.getCurrentStep().id === '修改筆記') {
                        Swissknife.Tutorial.gotoTutorialStep('建立連線');
                    } else if (Swissknife.Tutorial.getCurrentStep().id === '上傳圖片') {
                        Swissknife.Tutorial.gotoTutorialStep('預覽筆記內容');
                    }
                }
                UI.hideNodeForm();
            }
        });
        this.elHTML.querySelector('.btn-layout').addEventListener('click', (e) => {
            if (e.currentTarget.classExists('disabled')) {
                return;
            }
            this.cy.trigger('re-arrange');
            if (Swissknife.Tutorial.isTutorialMode()) {
                Swissknife.Tutorial.gotoTutorialStep('刪除資料');
            }
        });
        this.elHTML.querySelector('.btn-switch-delete-mode').addEventListener('click', () => {
            this.deletedMode = !this.deletedMode;
            Cyto.isDisableConnecting = this.deletedMode;
            if (this.deletedMode) {
                UI.switchToDeleteMode();
                UI.Cyto.switchToDeleteMode(this.cy);
            } else {
                UI.switchToNormalMode();
                UI.Cyto.switchToNormalMode(this.cy);
                if (Swissknife.Tutorial.isTutorialMode()) {
                    Swissknife.Tutorial.gotoTutorialStep('上傳圖片 - 展開編輯筆記表單');
                }
            }
        });
        this.elHTML.querySelector('.btn-delete-change').addEventListener('click', async () => {
            let nodeIds = this.cy.$('node.deleting').map((node) => {
                return node.data('id').replace('node-', '');
            });

            let relationshipIds = this.cy.$('edge.deleting').map((edge) => {
                return edge.data('id').replace('edge-', '');
            });

            nodeIds = nodeIds.filter((id) => {
                if (id.indexOf('preview') !== -1) {
                    return false;
                } else {
                    return true;
                }
            });

            relationshipIds = relationshipIds.filter((id) => {
                if (id.indexOf('preview') !== -1) {
                    return false;
                } else {
                    return true;
                }
            });
            if (nodeIds.length > 0) {
                const respForDeleteNode = await api.authApiService.nodes.delete({
                    token: this.args.token,
                    boardId: this.args.boardId,
                    nodeIds,
                });
                if (respForDeleteNode.status === RESPONSE_STATUS.OK) {
                    if (respForDeleteNode.data !== nodeIds.length && respForDeleteNode.data.length > 0) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, '部份刪除失敗');
                    } else if (respForDeleteNode.data === 0) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, '刪除失敗');
                    } else {
                        this.cy.$('node.deleting').remove();
                    }
                } else {
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, respForDeleteNode.data.errorMsg);
                }
            }

            if (relationshipIds.length > 0) {
                const respForDeleteRelationship = await api.authApiService.relationship.delete({
                    token: this.args.token,
                    boardId: this.args.boardId,
                    relationshipIds,
                });

                if (respForDeleteRelationship.status === RESPONSE_STATUS.OK) {
                    if (respForDeleteRelationship.data !== nodeIds.length && respForDeleteRelationship.data.length > 0) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, '部份刪除失敗');
                    } else if (respForDeleteRelationship.data === 0) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, '刪除失敗');
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
            if (Swissknife.Tutorial.isTutorialMode()) {
                Swissknife.Tutorial.gotoTutorialStep('上傳圖片 - 展開編輯筆記表單');
            }
            UI.Cyto.switchToNormalMode(this.cy);
        });
        this.elHTML.querySelector('.btn-close').addEventListener('click', UI.hideNodeForm);
        this.elHTML.querySelector('.mask').addEventListener('click', UI.hideNodeForm);

        document.addEventListener('save-edge', async (e) => {
            const resp = await api.authApiService.relationship.post({
                parent_node_id: e.detail.parent_node_id.replace(/node-/gi, ''),
                child_node_id: e.detail.child_node_id.replace(/node-/gi, ''),
                token: this.args.token,
                boardId: this.args.boardId
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                this.cy.trigger('saveEdgeDone', [{
                    ...resp.data,
                    edgeInstance: e.detail.edgeInstance
                }]);
                if (Swissknife.Tutorial.isTutorialMode()) {
                    Swissknife.Tutorial.gotoTutorialStep('重新排列');
                }
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
            };

            UI.showNodeForm(this.cy, '', '', '', position);
            if (Swissknife.Tutorial.isTutorialMode()) {
                Swissknife.Tutorial.gotoTutorialStep('新增筆記');
            }
        });
        document.addEventListener('double-tap-node', (e) => {
            if (this.deletedMode) {
                return;
            }

            if (Swissknife.Tutorial.isTutorialMode()) {
                Swissknife.Tutorial.endTour();
            }
            UI.openNodeWindow(this.args.boardId, e.detail.id, true);
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
            };
            if (Swissknife.Tutorial.isTutorialMode()) {
                if (Swissknife.Tutorial.getCurrentStep().id === '展開修改筆記表單') {
                    Swissknife.Tutorial.gotoTutorialStep('修改筆記');
                } else if (Swissknife.Tutorial.getCurrentStep().id === '上傳圖片 - 展開編輯筆記表單') {
                    Swissknife.Tutorial.gotoTutorialStep('上傳圖片');
                }
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
                this.elHTML.querySelector('.node-form').className.split(' ').indexOf('hide') === -1
            ) {
                UI.hideNodeForm();
            }
        });
        this.elHTML.querySelectorAll('.node-form .title').forEach((el) => {
            el.addEventListener('keyup', (e) => {
                const nodeId = this.elHTML.querySelector('.node-id').value.replace(/node-/gi, '');
                if (e.currentTarget.value === '') {
                    e.currentTarget.dataset['isComposing'] = false;
                } else {
                    const isComposing = e.currentTarget.dataset['isComposing'] === 'true';
                    if (e.keyCode === 13 && isComposing === false) {
                        if (nodeId === '') {
                            this.elHTML.querySelector('.btn-add').click();
                        } else {
                            this.elHTML.querySelector('.btn-update').click();
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
        this.elHTML.querySelector('.btn-copy-shared-link').addEventListener('click', (e) => {
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
            document.execCommand('copy');
            document.body.removeChild(tempElement);
            button.querySelector('span').innerHTML = '已複製';
            button.addClass('copied');
            setTimeout(() => {
                button.querySelector('span').innerHTML = '複製公開連結';
                button.removeClass('copied');
            }, 3000);
        });
        document.addEventListener('dropdown-node', (e) => {
            api.authApiService.node.patch({
                token: this.args.token,
                boardId: this.args.boardId,
                nodeId: e.detail.nodeId,
                x: e.detail.position.x,
                y: e.detail.position.y
            });
        });
        document.addEventListener('layout-done', async (e) => {
            // update node position
            api.authApiService.nodes.patch({
                token: this.args.token,
                boardId: this.args.boardId,
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
            const elNodeForm = this.elHTML.querySelector('.node-form');
            const elNodeDescriptoin = this.elHTML.querySelector('.node-form #node-description');
            let nodeDescription = elNodeDescriptoin.value;
            const nodeId = Number(elNodeForm.querySelector('.node-id').value.replace(/node-/gi, ''));
            const base64Files = await MindnoteFileReader.readFilesToBase64(files);
            for (let i = 0; i < base64Files.length; i++) {
                const injectResult = injectFlag(nodeDescription, elNodeDescriptoin.selectionStart, elNodeDescriptoin.selectionEnd);
                nodeDescription = injectResult.content;
                base64Files[i].clientSideFlagId = injectResult.flagId;
                base64Files[i].nodeId = nodeId;
            }
            elNodeDescriptoin.value = nodeDescription;
            const resp = await api.authApiService.images.post({
                base64Files,
                token: this.args.token,
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                let nodeDescription = elNodeDescriptoin.value;
                for (var i = 0; i < resp.data.length; i++) {
                    nodeDescription = nodeDescription.replace(
                        `![#${resp.data[i].clientSideFlagId} Uploading Image Title](Uploading Image URL)`,
                        `![#${resp.data[i].filename}](${ImageService.generateImageUrl(resp.data[i].filename)})`
                    );
                }
                elNodeDescriptoin.value = nodeDescription;
            } else {
                //fix: errorMsg 改成 data.message
                if (resp.httpStatus === 417) {
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
                } else {
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
                }
            }

            function injectFlag(content, start, end) {
                const flagId = guidGenerator();
                const result = [
                    content.substring(0, start),
                    '\r',
                    `![#${flagId} Uploading Image Title](Uploading Image URL)`,
                    '\r',
                    nodeDescription.substring(end)
                ];
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
            const elNodeForm = this.elHTML.querySelector('.node-form');
            const nodeId = Number(elNodeForm.querySelector('.node-id').value.replace(/node-/gi, ''));
            const fileData = await MindnoteFileReader.readFileToBase64(files[0]);
            const respForUploadImage = await api.authApiService.images.post({
                base64Files: [{
                    ...fileData,
                    nodeId
                }],
                token: this.args.token,
            });
            if (respForUploadImage.status === RESPONSE_STATUS.OK) {
                const data = respForUploadImage.data[0];
                UI.Cyto.updateBackgroundImage(this.cy, nodeId, ImageService.generateImageUrl(data.filename, 200));
                const respForUpdateNode = await api.authApiService.node.patch({
                    cover: data.filename,
                    token: this.args.token,
                    boardId: this.args.boardId,
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

    async _updateCover() {
        const base64File = await ImageService.extractBase64DataFromURL(this.cy.png())
        api.authApiService.images.post({
            base64Files: [base64File],
            token: this.args.token
        }, (e) => {
            api.authApiService.board.patch({
                token: this.args.token,
                boardId: this.args.boardId,
                image_id: e.data[0].imageContext.id
            });
        });
    }
}