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
        const boards = await api.authApiService.boards.get({
            ...args,
        });
        this.token = args.token;
        UI.header.generateNavigation([{
            title: 'Boards'
        }]);
        UI.generateUserBoards(boards.data).forEach((elBoardCard) => {
            UI.setBoardPublicPermission(elBoardCard, elBoardCard.dataset['is_public'] == 'true');
            elBoardCard.addEventListener('click', this._fillDataToForm);
            elBoardCard.querySelector('.btn-toggle').addEventListener('click', async (e) => {
                this._setPermission(elBoardCard);
                e.stopPropagation();
                e.preventDefault();
                return;
            })
        });
    }

    _bindEvent() {
        document.querySelector('.btn-add-board').addEventListener('click', async (e) => {
            const title = document.querySelector('.board-title').value;
            const board = (await api.authApiService.boards.post({
                token: this.token,
                title
            })).data;
            const boardEl = UI.addBoard(board);
            boardEl.addEventListener('click', (e) => {
                document.querySelector('.board-title').value = e.currentTarget.dataset['title'];
                document.querySelector('.board-id').value = e.currentTarget.dataset['id'];
            });
            document.querySelector('.board-title').value = '';
            document.querySelector('.board-id').value = '';
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
            document.querySelector('.board-title').value = '';
            document.querySelector('.board-id').value = '';
        });

        document.querySelector('.btn-delete-board').addEventListener('click', async (e) => {
            const boardId = document.querySelector('.board-id').value;
            await api.authApiService.board.delete({
                token: this.token,
                boardId
            })
            UI.removeBoard(boardId);
            document.querySelector('.board-title').value = '';
            document.querySelector('.board-id').value = '';
        })
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
}