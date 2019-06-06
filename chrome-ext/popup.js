(async () => {
    const src = chrome.extension.getURL('util/extended-prototype.js');
    const injectScript = await import(src);
    injectScript.extendHTMLElementProtoType();
    injectScript.extendStringProtoType();

    const srcBoard = chrome.extension.getURL('components/board.js');
    boardModuleBuilder = await import(srcBoard);
    const Board = boardModuleBuilder.Board;
    
    let HISTORY_ITEM_TEMPLATE = '<div class="title">{title}</div><div class="description">{description}</div>';
    const RESPONSE_STATUS = {
        OK: 'OK',
        FAILED: 'FAILED',
    };
    
    function init() {
        chrome.storage.sync.get(['token', 'userInfo', 'history', 'selectedNode', 'selectedBoard', 'selectedTab'], function (storage) {
            if (storage.token) {
                selectTab(storage.selectedTab)
                hideUnauthSection();
                setupProfile(storage.userInfo);
                generateHistory(storage.history);
                generateSelectedNode(storage.selectedNode);
                generateBoards();
                generateSelectedBoard(storage.selectedBoard);
            } else {
                hideAuthSection();
            }
        });
    }
    
    init();
    
    function hideUnauthSection() {
        document.querySelector('.un-auth').style.display = 'none';
        document.querySelector('.auth').style.display = 'block';
    }
    
    function hideAuthSection() {
        document.querySelector('.un-auth').style.display = 'block';
        document.querySelector('.auth').style.display = 'none';
    }
    
    function setupProfile(userInfo) {
        document.querySelector('.profile-container').innerHTML = '<img src="' + userInfo.picture + '" />'
        document.querySelector('.name').innerHTML = userInfo.name;
        document.querySelector('.email').innerHTML = userInfo.email;
    }
    
    selectBoard = (board) => {
        chrome.storage.sync.set({
            selectedBoard: {
                id: board.id,
                title: board.title,
                uniquename: board.uniquename
            }
        });
        generateSelectedBoard(board);
    }
    
    selectNode = (node) => {
        chrome.storage.sync.set({
            selectedNode: node
        });
        generateSelectedNode(node);
    }
    
    selectTab = (className) => {
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
    }
    
    generateSelectedBoard = (selectedBoard) => {
        const selectedBoardDom = document.querySelector('.selected-board');
        if (selectedBoard && selectedBoardDom) {
            selectedBoardDom.querySelector('.content').innerHTML = selectedBoard.title;
        }
    }
    
    generateBoards = () => {
        chrome.runtime.sendMessage({
            controller: 'board',
            action: 'get'
        }, function (resp) {
            if (resp.status === RESPONSE_STATUS.OK) {
                let boardDom = document.querySelector('.board');
                for (let i = 0; i < resp.data.boards.length; i++) {
                    const board = new Board(resp.data.boards[i],(e)=>{
                        selectBoard(e.currentTarget.dataset);
                    });
                    boardDom.appendChild(board.element);
                }
            } else {
                alert(resp.data.errorMsg);
            }
        });
    }
    
    function generateHistory(history) {
        if (!history) {
            return;
        }
        for (var i = 0; i < history.length; i++) {
            const historyItem = document.createElement('div');
            historyItem.dataset = {
                id: history[i].id
            }
            historyItem.className = 'item';
            historyItem.innerHTML = HISTORY_ITEM_TEMPLATE.replace(/{title}/gi, history[i].title)
                .replace(/{description}/gi, history[i].description)
                .replace(/{id}/gi, history[i].id)
            document.querySelector('.history').appendChild(historyItem);
            historyItem.addEventListener('click', (e) => {
                const node = {
                    id: e.currentTarget.dataset.id,
                    title: e.currentTarget.querySelector('.title').innerHTML,
                    description: e.currentTarget.querySelector('.description').innerHTML
                };
                selectNode(node);
            });
        }
    }
    
    function generateSelectedNode(node) {
        if (node) {
            document.querySelector('.selected-node .content').innerHTML = node.title;
        }
    }
    
    clearSelectedNode = () => {
        document.querySelector('.selected-node .content').innerHTML = '';
        chrome.storage.sync.set({
            selectedNode: null
        });
    }
    
    clearSelectedBoard = () => {
        document.querySelector('.selected-board .content').innerHTML = '';
        chrome.storage.sync.set({
            selectedBoard: null
        });
    }
    
    postBoard = (formData) => {
        chrome.runtime.sendMessage({
            controller: 'board',
            action: 'post',
            data: formData
        }, function (resp) {
            if (resp.status === RESPONSE_STATUS.OK) {
                document.querySelector('.board-form').clearForm();
                const board = new Board(resp.data,(e) => {
                    selectBoard(e.currentTarget.dataset);
                });
                document.querySelector('.board').prepend(board.element);
            } else {
                alert(resp.errorMsg);
            }
        });
    }
    
    /**
     * Event Listener
     */
    
    document.querySelector('.selected-node').addEventListener('click', clearSelectedNode);
    document.querySelector('.selected-board').addEventListener('click', clearSelectedBoard);
    document.querySelector('.auth-google').addEventListener('click', function () {
        chrome.runtime.sendMessage({
            controller: 'auth'
        }, (resp) => {
            if (resp.status === RESPONSE_STATUS.OK) {
                init();
            } else {
                alert(resp.data.errorMsg);
            }
        });
    });
    
    document.querySelector('.btn-logout').addEventListener('click', () => {
        chrome.storage.sync.set({
            token: null,
            userInfo: null,
            history: null,
            selectedNode: null
        }, () => {
            hideAuthSection();
        });
    });
    
    document.querySelectorAll('.tab-board,.tab-history').forEach((el) => {
        el.addEventListener('click', (e) => {
            const className = e.currentTarget.className.replace(/tab\-/gi, '');
            const classes = className.split(' ')
            if (classes.indexOf('selected') !== -1) {
                classes.splice(classes.indexOf('selected'), 1);
                showClassName = classes.join(' ');
            } else {
                showClassName = classes.join(' ');
            }
            selectTab(showClassName);
        })
    });
    
    document.querySelector('.tab-board .expand').addEventListener('click', (e) => {
        const boardForm = document.querySelector('.board-form');
        if (boardForm.classExists('hide')) {
            boardForm.removeClass('hide');
            boardForm.querySelectorAll('input')[0].focus();
        } else {
            boardForm.addClass('hide');
        }
    }, false);
    
    document.querySelectorAll('.board-form input').forEach((el) => {
        el.addEventListener('keyup', (e) => {
            if (e.keyCode === 13) {
                const formData = document.querySelector('.board-form').collectFormData();
                postBoard(formData);
            }
        });
    })
    
    document.querySelector('.board-form .add').addEventListener('click', (e) => {
        const formData = document.querySelector('.board-form').collectFormData();
        postBoard(formData);
    });
})();
  
