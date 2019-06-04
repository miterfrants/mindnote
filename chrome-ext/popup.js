var HISTORY_ITEM_TEMPLATE = '<div class="title">{title}</div><div class="description">{description}</div>';
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
            let template = '{title}';
            for (let i = 0; i < resp.data.boards.length; i++) {
                const boardItem = document.createElement('div');
                boardItem.className = 'item';
                const board = resp.data.boards[i];
                boardItem.innerHTML = template.replace(/{title}/gi, board.title);
                if (!boardItem.dataset) {
                    boardItem.dataset = {};
                }
                boardItem.dataset.id = board.id;
                boardItem.dataset.title = board.title;
                boardItem.dataset.uniquename = board.uniquename;

                boardItem.addEventListener('click', (e) => {
                    selectBoard(e.currentTarget.dataset);
                });
                boardDom.appendChild(boardItem);
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

        if(classes.indexOf('selected') !== -1){
            classes.splice(classes.indexOf('selected'),1);
            showClassName = classes.join(' ');
        } else {
            showClassName = classes.join(' ');
        }
        selectTab(showClassName);
    })
});