import {
    UI
} from '/mindmap/ui.js';

import {
    api
} from '/mindmap/service/api.v2.js';
import {
    RESPONSE_STATUS
} from '/mindmap/config.js';

export class UserBoards {
    constructor(args, context) {
        this.init(args, context);
        this.run(args, context);
    }
    async init(args, context) {
        this._bindEvent();
    }
    async run(args, context) {
        this.continueDeleteCount = 0;
        const boards = await api.authApiService.boards.get({
            ...args,
        });
        this.token = args.token;
        UI.header.generateNavigation([{
            title: 'Boards'
        }]);
        UI.restoreBoardForm();
        UI.generateUserBoards(boards.data).forEach((elBoardCard) => {
            UI.setBoardPublicPermission(elBoardCard, elBoardCard.dataset['is_public'] == 'true');
            this.initBoardCard(elBoardCard);
        });
    }

    _bindEvent() {
        document.querySelector('.btn-add-board').addEventListener('click', async (e) => {
            const title = document.querySelector('.board-title').value;
            const board = (await api.authApiService.boards.post({
                token: this.token,
                title
            })).data;
            const elBoardCard = UI.addBoard(board);
            this.initBoardCard(elBoardCard);
            document.querySelector('.board-title').value = '';
            document.querySelector('.board-id').value = '';
            e.stopPropagation();
            e.preventDefault();
            return;
        });
        document.querySelector('.btn-update-board').addEventListener('click', async (e) => {
            const title = document.querySelector('.board-title').value;
            const boardId = document.querySelector('.board-id').value;
            const board = (await api.authApiService.board.patch({
                token: this.token,
                title,
                boardId
            })).data;
            UI.updateBoard(board);
            setTimeout(() => {
                UI.hideBoardForm();
                document.querySelector('.board-title').value = '';
                document.querySelector('.board-id').value = '';
            }, 300);
            e.stopPropagation();
            e.preventDefault();
            return;
        });

        document.querySelector('.btn-delete-board').addEventListener('click', async (e) => {
            var result = 'DELETE'
            if (this.continueDeleteCount <= 2) {
                result = prompt('please type "DELETE"');
            }

            this.continueDeleteCount += 1;
            setTimeout(() => {
                this.continueDeleteCount = 0;
            }, 120 * 1000);

            if (result != 'DELETE') {
                return;
            }
            const boardId = document.querySelector('.board-id').value;
            await api.authApiService.board.delete({
                token: this.token,
                boardId
            })
            UI.restoreBoardForm();
            UI.removeBoard(boardId);
            document.querySelector('.board-title').value = '';
            document.querySelector('.board-id').value = '';
        });

        document.querySelector('.btn-virtual-add-board').addEventListener('click', (e) => {
            const container = e.currentTarget.querySelector('.inner');
            UI.showBoardForm(container, 'add');
        })

        document.querySelector('.board-form input.board-title').addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            return;
        })

        document.querySelector('.board-form input.board-title').addEventListener('keyup', (e) => {
            if (e.keyCode === 13) {
                document.querySelector('.board-form .btn-add-board:not(.hide),.board-form .btn-update-board:not(.hide)').click();
            } else if (e.keyCode === 27) {
                UI.hideBoardForm();
            }
        });
    }

    _fillDataToForm(e) {
        document.querySelector('.board-title').value = e.currentTarget.dataset['title'];
        document.querySelector('.board-id').value = e.currentTarget.dataset['id'];
    }

    async _setPermission(elBoardCard) {
        let isPublic = !(elBoardCard.dataset['is_public'] === 'true');
        UI.setBoardPublicPermission(elBoardCard, isPublic);
        let resp = await api.authApiService.board.patch({
            token: this.token,
            boardId: elBoardCard.dataset['id'],
            is_public: isPublic
        });

        if (resp.status !== RESPONSE_STATUS.OK) {
            UI.setBoardPublicPermission(elBoardCard, !isPublic);
        } else {
            elBoardCard.dataset['is_public'] = resp.data.is_public;
        }
    }

    initBoardCard(elBoardCard) {
        elBoardCard.addEventListener('click', (e) => {
            if (e.currentTarget.querySelectorAll('.show-form').length > 0) {
                return;
            }
            this._fillDataToForm(e);
            UI.showBoardForm(e.currentTarget.querySelector('.inner'), 'update');
        });
        elBoardCard.querySelector('.btn-toggle').addEventListener('click', async (e) => {
            this._setPermission(elBoardCard);
            e.stopPropagation();
            e.preventDefault();
            return;
        })
    }
}