import {
    UI
} from '/mindnote/ui.js';

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
    RouterController
} from '/mindnote/route/router-controller.js';

export class MyBoards extends RouterController {
    constructor(elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.token = args.token;
        this.bindEvent();
    }

    async enter(args) {
        super.enter(args);
        this.continueDeleteCount = 0;
        const resp = await api.authApiService.boards.get({
            ...this.args,
        });

        if (resp.status === RESPONSE_STATUS.FAILED) {
            if (resp.httpStatus === 417) {
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
            } else {
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
            }
        }

        UI.header.generateNavigation([{
            title: '我的分類'
        }]);
        UI.generateUserBoards(resp.data).forEach((elBoardCard) => {
            this.initBoardCard(elBoardCard);
        });
    }

    bindEvent() {
        this.initBoardCard(document.querySelector('.btn-virtual-add-board'));
    }

    async _setPermission(elBoardCard) {
        let isPublic = !(elBoardCard.dataset['is_public'] === 'true');
        UI.setBoardPublicPermission(elBoardCard, isPublic);
        let resp = await api.authApiService.board.patch({
            token: this.args.token,
            boardId: elBoardCard.dataset['id'],
            is_public: isPublic
        });

        if (resp.status === RESPONSE_STATUS.FAILED) {
            UI.setBoardPublicPermission(elBoardCard, !isPublic);
            if (resp.httpStatus === 417) {
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
            } else {
                throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
            }
        }
        elBoardCard.dataset['is_public'] = resp.data.is_public;
    }

    initBoardCard(elBoardCard) {
        if (elBoardCard.dataset['is_public'] !== undefined) {
            UI.setBoardPublicPermission(elBoardCard, elBoardCard.dataset['is_public'] == 'true');
        }
        const elBtnTogglePermission = elBoardCard.querySelector('.btn-toggle-permission');
        const elBtnSwitchEditMode = elBoardCard.querySelector('.btn-switch-edit-mode');
        const elBtnUpdateBoard = elBoardCard.querySelector('.btn-update-board');
        const elBtnDeleteBoard = elBoardCard.querySelector('.btn-delete-board');
        const elBtnAddBoard = elBoardCard.querySelector('.btn-add-board');

        if (elBtnSwitchEditMode) {
            elBtnSwitchEditMode.addEventListener('click', (e) => {
                if (e.currentTarget.classExists('show-form')) {
                    return;
                }
                elBoardCard.querySelector('.board-title').value = e.currentTarget.dataset['title'];
                UI.showBoardForm(elBoardCard);
            });
        }

        if (elBtnTogglePermission) {
            elBtnTogglePermission.addEventListener('click', async (e) => {
                this._setPermission(elBoardCard);
                e.stopPropagation();
                e.preventDefault();
                return;
            })
        }

        if (elBtnUpdateBoard) {
            elBtnUpdateBoard.addEventListener('click', async (e) => {
                const elButtonUpdateBoard = e.currentTarget;
                if (elButtonUpdateBoard.classExists('disabled')) {
                    return;
                }
                elButtonUpdateBoard.addClass('disabled');
                const title = elBoardCard.querySelector('input.board-title').value;
                const boardId = elBoardCard.dataset['id'];
                const resp = (await api.authApiService.board.patch({
                    token: this.token,
                    title,
                    boardId
                }));

                if (resp.status === RESPONSE_STATUS.FAILED) {
                    elButtonUpdateBoard.removeClass('disabled');
                    if (resp.httpStatus === 417) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
                    } else {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
                    }
                }

                const board = resp.data;
                UI.updateBoard(board);
                setTimeout(() => {
                    UI.hideBoardForm(elBoardCard);
                    elButtonUpdateBoard.removeClass('disabled');
                }, 300);

                e.stopPropagation();
                e.preventDefault();
                return;
            });
        }

        if (elBtnDeleteBoard) {
            elBtnDeleteBoard.addEventListener('click', async (e) => {
                const elButtonDel = e.currentTarget;
                if (elButtonDel.classExists('disabled')) {
                    return;
                }

                elButtonDel.addClass('disabled');
                var result = 'DELETE';
                if (this.continueDeleteCount <= 2) {
                    result = prompt('如果需要刪除，請輸入 "DELETE"');
                }

                this.continueDeleteCount += 1;
                setTimeout(() => {
                    this.continueDeleteCount = 0;
                }, 120 * 1000);

                if (result != 'DELETE') {
                    return;
                }
                const boardId = elBoardCard.dataset['id'];
                const resp = await api.authApiService.board.delete({
                    token: this.token,
                    boardId
                })

                elButtonDel.removeClass('disabled');
                if (resp.status === RESPONSE_STATUS.FAILED) {
                    if (resp.httpStatus === 417) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
                    } else {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
                    }
                }
                UI.removeBoard(boardId);
                e.stopPropagation();
                e.preventDefault();
                return;
            });
        }

        if (elBtnAddBoard) {
            elBtnAddBoard.addEventListener('click', async (e) => {
                const elAddBoardCard = document.querySelector('.btn-virtual-add-board');
                const boardTitle = elAddBoardCard.querySelector('.board-title').value;
                if (elBtnAddBoard.classExists('disabled')) {
                    return;
                }
                elBtnAddBoard.addClass('disabled');

                let resp = await api.authApiService.boards.post({
                    token: this.token,
                    title: boardTitle
                });

                if (resp.status === RESPONSE_STATUS.FAILED) {
                    elBtnAddBoard.removeClass('disabled');
                    if (resp.httpStatus === 417) {
                        Toaster.popup(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg, 5000, '/mindnote/checkout/');
                        return;
                    } else {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
                    }
                }

                const board = resp.data;
                const elBoardCard = UI.addBoard(board);
                this.initBoardCard(elBoardCard);
                setTimeout(() => {
                    elBtnAddBoard.removeClass('disabled');
                    elAddBoardCard.querySelector('.board-title').value = '';
                }, 300);
            });
        }

        elBoardCard.querySelector('input.board-title').addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            return;
        });

        elBoardCard.querySelector('input.board-title').addEventListener('keyup', (e) => {
            if (e.currentTarget.value === '') {
                e.currentTarget.dataset['isComposing'] = false;
            } else {
                const isComposing = e.currentTarget.dataset['isComposing'] === 'true';
                if (e.keyCode === 13 && isComposing === false) {
                    if (elBtnUpdateBoard) {
                        elBtnUpdateBoard.click();
                    } else {
                        elBtnAddBoard.click();
                    }

                } else if (e.keyCode === 27 && isComposing === false) {
                    UI.hideBoardForm(elBoardCard);
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
    }
}