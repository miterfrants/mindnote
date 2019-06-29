import {
    extendHTMLElementProtoType,
    extendStringProtoType
} from '/util/extended-prototype.js';

extendHTMLElementProtoType();
extendStringProtoType();

import {
    debounce
} from '/util/debounce.js';

import {
    autoComplete
} from '/util/auto-complete.min.js';

import {
    Board
} from '/components/board/board.js';

import {
    Node
} from '/components/node/node.js';

import {
    DATA
} from '/popup/data.js';

import {
    UI
} from '/popup/ui.js';

import {
    NODE_HISTORY_LIMIT
} from '/config.js';

let isShowNodeForm = false;
const arrayQueryString = location.search.substring(1).split('&');
for (var i = 0; i < arrayQueryString.length; i++) {
    if (arrayQueryString[i] === 'action=create-node') {
        isShowNodeForm = true;
    }
}

init(isShowNodeForm);

function init(isShowNodeForm) {
    chrome.storage.sync.get(['token', 'userInfo', 'history', 'selectedNode', 'selectedBoard', 'selectedTab', 'textSelection'], async (storage) => {
        let elBoards = [];
        if (storage.token) {
            const boardsPureData = await DATA.getBoardsAsync();
            for (let i = 0; i < boardsPureData.length; i++) {
                const boardInstance = await buildBoardInstantAsync(boardsPureData[i]);
                elBoards.push(boardInstance.element);
            }
        }
        UI.init(storage, elBoards, Node, isShowNodeForm, selectRelation);
    });

    if (isShowNodeForm) {
        setupAutoComplete();
    }
}

/**
 * Event Listener
 */

document.querySelector('.selected-node').addEventListener('click', UI.clearSelectedNode);
document.querySelector('.selected-board').addEventListener('click', UI.clearSelectedBoard);
document.querySelector('.auth-google').addEventListener('click', async () => {
    try {
        const resp = await DATA.authAsync();
        chrome.storage.sync.set({
            token: resp.data.token,
            userInfo: resp.data.userInfo
        });
        chrome.storage.sync.get(['token', 'userInfo', 'history', 'selectedNode', 'selectedBoard', 'selectedTab', 'textSelection'], async (storage) => {
            const boards = await DATA.getBoardsAsync();
            UI.init(storage, boards, Node, isShowNodeForm);
        });
    } catch (error) {}
});

document.body.addEventListener('keyup', (e) => {
    if (e.ctrlKey) {
        if (e.keyCode === 49 && isShowNodeForm) {
            UI.showContentWithTab('nodeform');
        } else if (e.keyCode === 50) {
            UI.showContentWithTab('boards');
        } else if (e.keyCode === 51) {
            UI.showContentWithTab('history');
        }
    }
    e.stopPropagation();
    e.preventDefault();
})

document.querySelector('.btn-logout').addEventListener('click', () => {
    chrome.storage.sync.set({
        token: null,
        userInfo: null,
        history: null,
        selectedBoard: null,
        selectedNode: null
    }, () => {
        UI.hideAuthSection();
        UI.clear();
    });
});

document.querySelectorAll('.tab-boards,.tab-history,.tab-nodeform').forEach((el) => {
    el.addEventListener('click', (e) => {
        const className = e.currentTarget.className.replace(/tab\-/gi, '');
        const classes = className.split(' ')
        let showClassName = '';
        if (classes.indexOf('selected') !== -1) {
            classes.splice(classes.indexOf('selected'), 1);
            showClassName = classes.join(' ');
        } else {
            showClassName = classes.join(' ');
        }
        UI.showContentWithTab(showClassName);
    })
});

document.querySelectorAll('.board-form input').forEach((el) => {
    el.addEventListener('keyup', async (e) => {
        if (e.keyCode === 13) {
            const formData = document.querySelector('.board-form').collectFormData();
            try {
                const resp = await DATA.postBoardAsync(formData);
                const board = await buildBoardInstantAsync({
                    ...resp.data
                });
                UI.postBoardFinish(board.element);
            } catch (error) {}
        }
    });
})

document.querySelector('.board-form .add').addEventListener('click', async (e) => {
    const formData = document.querySelector('.board-form').collectFormData();
    try {
        // storage.userInfo.username
        const resp = await DATA.postBoardAsync(formData);
        const board = await buildBoardInstantAsync({
            ...resp.data
        });
        UI.postBoardFinish(board.element);
    } catch (error) {}
});

document.querySelector('.btn-create').addEventListener('click', async (e) => {
    var title = document.querySelector('.nodeform .title input').value,
        description = document.querySelector('.nodeform .desc textarea').value;
    try {
        const storage = await getStorageAsync(['selectedBoard'])
        const resp = await DATA.postNodeAsync(storage.selectedBoard.id, title, description);
        appendNodeHistory(resp.data, () => {
            window.close();
        });
    } catch (error) {}
});

/**
 * Private Function
 */
async function setupAutoComplete() {
    const clipboard = await new Promise((resolve) => {
        chrome.storage.sync.get(['clipboard'], (storage) => {
            resolve(storage.clipboard);
        });
    })

    new autoComplete({
        selector: '.nodeform input',
        minChars: 0,
        source: function (term, suggest) {
            term = term.toLowerCase();
            var choices = clipboard;
            var matches = [];
            if (choices) {
                for (i = 0; i < choices.length; i++) {
                    if (choices[i] !== null && choices[i].length > 0 && ~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
                }
            }

            suggest(matches);
        }
    });

    new autoComplete({
        selector: '.nodeform textarea',
        minChars: 0,
        source: function (term, suggest) {
            term = term.toLowerCase();
            var choices = clipboard;
            var matches = [];
            for (i = 0; i < choices.length; i++) {
                if (choices[i] !== null && choices[i].length > 0 && ~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
            }
            suggest(matches);
        }
    });
}

function getStorageAsync(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, (storage) => {
            resolve(storage);
        })
    })
}

function selectRelation(node, board) {
    chrome.storage.sync.set({
        selectedNode: node,
        selectedBoard: node ? {
            id: node.board_id,
            title: node.board_title,
            is_public: node.board_is_public
        } : board
    });
    UI.generateRelation(node, board);
}

async function buildBoardInstantAsync(data) {
    const storage = await getStorageAsync(['userInfo']);
    const boardInstance = new Board({
        ...data,
        username: storage.userInfo.username
    }, (e) => {
        selectRelation(null, boardInstance.data);
    }, async (e) => {
        try {
            await DATA.deleteBoardAsync({
                boardId: boardInstance.data.id
            });
            UI.removeBoard(boardInstance.element);
        } catch (error) {}
    }, (e) => {
        const isPublic = !boardInstance.data.is_public;
        boardInstance.data.is_public = isPublic;
        changeBoardPermissionDebounce({
            ...boardInstance.data,
            is_public: isPublic,
        }, boardInstance);
    });
    return boardInstance;
}

function changeBoardPermissionDebounce(formData, boardInstance) {
    debounce(async (formData, boardInstance) => {
        try {
            const board = await DATA.changeBoardPermissionAsync(formData);
            boardInstance.update(board);
        } catch (error) {}
    }, 1000)(formData, boardInstance);
}

function appendNodeHistory(node, callback) {
    chrome.storage.sync.get(['history'], function (data) {
        let history = data.history
        if (!history || !Array.isArray(history)) {
            history = [];
        }
        history.unshift(node);
        history.splice(NODE_HISTORY_LIMIT);
        chrome.storage.sync.set({
            history
        }, callback);
    })
}