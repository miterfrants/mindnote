const RESPONSE_STATUS = {
    OK: 'OK',
    FAILED: 'FAILED',
};

(async () => {
    const src = chrome.extension.getURL('util/extended-prototype.js');
    const injectScript = await import(src);
    injectScript.extendHTMLElementProtoType();
    injectScript.extendStringProtoType();
    const debounce = (await import(chrome.extension.getURL('util/debounce.js'))).debounce;
    const autoComplete = (await import(chrome.extension.getURL('util/auto-complete.min.js'))).autoComplete;

    const Board = (await import(chrome.extension.getURL('components/board/board.js'))).Board;
    const Node = (await import(chrome.extension.getURL('components/node/node.js'))).Node
    const DATA = (await import(chrome.extension.getURL('popup/data.js'))).DATA;
    const UI = (await import(chrome.extension.getURL('popup/ui.js'))).UI;

    const arrayQueryString = location.search.substring(1).split('&');
    let showNodeForm = false;
    for (var i = 0; i < arrayQueryString.length; i++) {
        if (arrayQueryString[i] === 'action=create-node') {
            showNodeForm = true;
        }
    }

    chrome.storage.sync.get(['token', 'userInfo', 'history', 'selectedNode', 'selectedBoard', 'selectedTab', 'textSelection'], async (storage) => {
        const boards = await DATA.getBoardsAsync();
        UI.init(storage, boards, Node, showNodeForm);
    });

    selectRelation = (node, board) => {
        chrome.storage.sync.set({
            selectedNode: node,
            selectedBoard: node ? {
                uniquename: node.board_uniquename,
                title: node.board_title,
                is_public: node.board_is_public
            } : board
        });
        UI.generateRelation(node, board);
    }

    buildBoardInstantAsync = (data) => {
        const board = new Board(data, (e) => {
            selectRelation(null, board.data);
        }, async (e) => {
            await DATA.removeBoard({
                uniquename: board.data.uniquename
            });
            UI.removeBoard(board.element);
        }, (e) => {
            const isPublic = !(board.data.is_public === 'true');
            board.data.is_public = isPublic;
            changeBoardPermissionDebounce({
                ...board.data,
                is_public: isPublic,
            }, board);
        });
        return board;
    }

    changeBoardPermissionDebounce = debounce(async (formData, boardItem) => {
        const board = await DATA.changeBoardPermission(formData);
        boardItem.update(board);
    }, 1500);

    /**
     * Event Listener
     */

    // auto-complete
    if (showNodeForm) {
        const clipboard = await new Promise((resolve) => {
            chrome.storage.sync.get(['clipboard'], (storage) => {
                resolve(storage.clipboard);
            });
        })

        const nodeTitleAutoComplete = new autoComplete({
            selector: '.nodeform input',
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

        const nodeDescAutoComplete = new autoComplete({
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

    document.querySelector('.selected-node').addEventListener('click', UI.clearSelectedNode);
    document.querySelector('.selected-board').addEventListener('click', UI.clearSelectedBoard);
    document.querySelector('.auth-google').addEventListener('click', async () => {
        await DATA.auth();
        chrome.storage.sync.get(['token', 'userInfo', 'history', 'selectedNode', 'selectedBoard', 'selectedTab', 'textSelection'], async (storage) => {
            const boards = await DATA.getBoardsAsync();
            UI.init(storage, boards, Node, showNodeForm);
        });
    });

    document.body.addEventListener('keyup', (e) => {
        if (e.ctrlKey) {
            if (e.keyCode === 49 && showNodeForm) {
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
            if (classes.indexOf('selected') !== -1) {
                classes.splice(classes.indexOf('selected'), 1);
                showClassName = classes.join(' ');
            } else {
                showClassName = classes.join(' ');
            }
            UI.showContentWithTab(showClassName);
        })
    });

    document.querySelector('.tab-boards .expand').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        UI.expandForm(e);
    }, false);

    document.querySelectorAll('.board-form input').forEach((el) => {
        el.addEventListener('keyup', async (e) => {
            if (e.keyCode === 13) {
                const formData = document.querySelector('.board-form').collectFormData();
                const board = await DATA.postBoard(formData);
                UI.postBoardFinish(board.element);
            }
        });
    })

    document.querySelector('.board-form .add').addEventListener('click', async (e) => {
        const formData = document.querySelector('.board-form').collectFormData();
        const board = await DATA.postBoard(formData);
        UI.postBoardFinish(board.element);
    });

    document.querySelector('.btn-create').addEventListener('click', (e) => {
        var title = document.querySelector('.nodeform .title input').value,
            description = document.querySelector('.nodeform .desc textarea').value;
        DATA.postNode(title, description);
    });
})();