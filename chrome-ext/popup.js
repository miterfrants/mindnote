const RESPONSE_STATUS = {
    OK: 'OK',
    FAILED: 'FAILED',
};

(async () => {
    const src = chrome.extension.getURL('util/extended-prototype.js');
    const injectScript = await import(src);
    injectScript.extendHTMLElementProtoType();
    injectScript.extendStringProtoType();

    const Board = (await import(chrome.extension.getURL('components/board/board.js'))).Board;
    const Node = (await import(chrome.extension.getURL('components/node/node.js'))).Node;

    const debounceSrc = chrome.extension.getURL('util/debounce.js');
    const debounceScript = await import(debounceSrc);
    

    UI.init(Node);

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

    changeBoardPermissionDebounce = debounceScript.debounce(async (formData, boardItem) => {
        const board = await DATA.changeBoardPermission(formData);
        boardItem.update(board);
    }, 1500);

    /**
     * Event Listener
     */

    document.querySelector('.selected-node').addEventListener('click', UI.clearSelectedNode);
    document.querySelector('.selected-board').addEventListener('click', UI.clearSelectedBoard);
    document.querySelector('.auth-google').addEventListener('click', async () => {
        await DATA.auth();
        const boards = await DATA.getBoardsAsync();
        UI.init(boards, Node);
    });

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

    document.querySelectorAll('.tab-boards,.tab-history').forEach((el) => {
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

    document.querySelector('.tab-boards .expand').addEventListener('click', UI.expandForm, false);

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
})();

const DATA = {
    getBoardsAsync: () => {
        return new Promise(function (resolve) {
            chrome.runtime.sendMessage({
                controller: 'boards',
                action: 'get'
            }, (resp) => {
                if (resp.status === RESPONSE_STATUS.OK) {
                    resolve(resp.data);
                } else {
                    alert(resp.data.errorMsg);
                    resolve([]);
                }
            });
        })
    },
    postBoard: (formData) => {
        return new Promise(function (resolve) {
            chrome.runtime.sendMessage({
                controller: 'board',
                action: 'post',
                data: formData
            }, async (resp) => {
                if (resp.status === RESPONSE_STATUS.OK) {
                    const board = await buildBoardInstantAsync(resp.data);
                    resolve(board);
                } else {
                    alert(resp.errorMsg);
                    resolve(null);
                }
            });
        });
    },
    removeBoard: (formData, board) => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({
                controller: 'board',
                action: 'delete',
                data: formData
            }, function (resp) {
                if (resp.status === RESPONSE_STATUS.OK) {
                    resolve();
                } else {
                    alert(resp.errorMsg);
                    reject();
                }
            })
        })
    },
    changeBoardPermission: (formData) => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({
                controller: 'board',
                action: 'patch',
                data: {
                    ...formData,
                    is_public: formData.is_public
                }
            }, async (resp) => {
                if (resp.status === RESPONSE_STATUS.OK) {
                    resolve(resp.data);
                } else {
                    alert(resp.errorMsg);
                    reject();
                }
            });
        })
    },
    auth: () => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({
                controller: 'auth'
            }, (resp) => {
                if (resp.status === RESPONSE_STATUS.OK) {
                    resolve();
                } else {
                    alert(resp.data.errorMsg);
                    reject();
                }
            });
        });
    }
}

const UI = {
    expandForm: () => {
        const boardForm = document.querySelector('.board-form');
        if (boardForm.classExists('hide')) {
            boardForm.removeClass('hide');
            boardForm.querySelectorAll('input')[0].focus();
        } else {
            boardForm.addClass('hide');
        }
    },
    init: async (Node) => {
        chrome.storage.sync.get(['token', 'userInfo', 'history', 'selectedNode', 'selectedBoard', 'selectedTab'], async (storage) => {
            if (storage.token) {
                const boards = await DATA.getBoardsAsync();
                UI.setupProfile(storage.userInfo);
                UI.hideUnauthSection();
                UI.generateRelation(storage.selectedNode, storage.selectedBoard);
                UI.showContentWithTab(storage.selectedTab)
                UI.generateHistory(storage.history, Node);
                UI.generateBoards(boards);
            } else {
                UI.hideAuthSection();
            }
        });
    },
    generateRelation: (node, board) => {
        if (node) {
            document.querySelector('.selected-node .content').innerHTML = node.title;
            document.querySelector('.selected-board .content').innerHTML = node.board_title;
        } else if (board) {
            document.querySelector('.selected-node .content').innerHTML = '';
            document.querySelector('.selected-board .content').innerHTML = board.title;
        }
    },
    hideUnauthSection: () => {
        document.querySelector('.un-auth').style.display = 'none';
        document.querySelector('.auth').style.display = 'block';
    },
    hideAuthSection: () => {
        document.querySelector('.un-auth').style.display = 'block';
        document.querySelector('.auth').style.display = 'none';
    },
    clear: () => {
        document.querySelector('.boards').innerHTML = '';
        document.querySelector('.history').innerHTML = '';
    },
    setupProfile: (userInfo) => {
        document.querySelector('.profile-container').innerHTML = '<img src="' + userInfo.picture + '" />'
        document.querySelector('.name').innerHTML = userInfo.name;
        document.querySelector('.email').innerHTML = userInfo.email;
    },
    generateBoards: async (boards) => {
        let container = document.querySelector('.boards');
        for (let i = 0; i < boards.length; i++) {
            const board = await buildBoardInstantAsync(boards[i]);
            container.appendChild(board.element);
        }
    },
    showContentWithTab: (className) => {
        if (!className) {
            className = 'board';
        }
        const children = document.querySelector('.body').children;
        for (let i = 0; i < children.length; i++) {
            children[i].style.display = 'none';
            if (children[i].className.split(' ').indexOf(className) !== -1) {
                children[i].style.display = 'block';
            }
        }
        document.querySelectorAll('li[class^="tab-"]').forEach((el) => {
            // remove tab selected class
            const classNames = el.className.split(' ');
            if (classNames.indexOf('selected') !== -1) {
                classNames.splice(classNames.indexOf('selected'), 1)
                const newClassName = classNames.join(' ');
                el.className = newClassName;
            }
            if (el.className.split(' ').indexOf('tab-' + className) !== -1) {
                el.className = el.className + ' selected';
            }
        });
        chrome.storage.sync.set({
            selectedTab: className
        });
    },
    generateHistory: (history, Node) => {
        if (!history) {
            return;
        }
        for (var i = 0; i < history.length; i++) {
            const node = new Node(history[i], (e) => {
                selectRelation(node.data, null); // need fix
            });
            document.querySelector('.history').appendChild(node.element);
        }
    },
    clearSelectedNode: () => {
        document.querySelector('.selected-node .content').innerHTML = '';
        chrome.storage.sync.set({
            selectedNode: null
        });
    },
    clearSelectedBoard: () => {
        document.querySelector('.selected-node .content').innerHTML = '';
        document.querySelector('.selected-board .content').innerHTML = '';
        chrome.storage.sync.set({
            selectedBoard: null,
            selectedNode: null
        });
    },
    postBoardFinish: (boardElement) => {
        document.querySelector('.board-form').clearForm();
        document.querySelector('.boards').prepend(boardElement);
    },
    removeBoard: (boardElement) => {
        boardElement.parentElement.removeChild(boardElement);
    }
}