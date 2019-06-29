export const UI = {
    init: async (storage, elBoards, Node, isShowNodeForm, nodeClickHandler) => {
        if (storage.token) {
            if (isShowNodeForm) {
                UI.showNodeForm();
                UI.showContentWithTab('nodeform');
                UI.setNodeFormContent(storage.textSelection, storage.textSelection);
            } else if (storage.selectedBoard !== 'nodeform' || storage.selectedBoard !== null) {
                UI.hideNodeForm();
                UI.showContentWithTab('');
            } else {
                UI.hideNodeForm();
                UI.showContentWithTab('boards');
            }
            UI.setupProfile(storage.userInfo);
            UI.hideUnauthSection();
            UI.generateRelation(storage.selectedNode, storage.selectedBoard);

            UI.generateHistory(storage.history, Node, nodeClickHandler);
            UI.generateBoards(elBoards);
        } else {
            UI.hideAuthSection();
        }
    },
    showNodeForm: () => {
        document.querySelector('.tab-nodeform').removeClass('hide');
        document.querySelector('.nodeform').removeClass('hide');
    },
    hideNodeForm: () => {
        document.querySelector('.tab-nodeform').addClass('hide');
        document.querySelector('.nodeform').addClass('hide');
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
        document.querySelector('.unauth').style.display = 'none';
        document.querySelector('.auth').style.display = 'block';
    },
    hideAuthSection: () => {
        document.querySelector('.unauth').style.display = 'block';
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
    generateBoards: async (elBoards) => {
        let container = document.querySelector('.boards');

        for (let i = 0; i < elBoards.length; i++) {
            container.appendChild(elBoards[i]);
        }
    },
    showContentWithTab: (className) => {
        if (!className) {
            className = 'boards';
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

        if (className === 'nodeform') {
            setTimeout(() => {
                document.querySelector('.nodeform .title input').focus();
            }, 100)
        }

        chrome.storage.sync.set({
            selectedTab: className
        });
    },
    generateHistory: (history, Node, nodeClickHandler) => {
        if (!history) {
            return;
        }
        for (var i = 0; i < history.length; i++) {
            const node = new Node(history[i], (e) => {
                nodeClickHandler(node.data, null);
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
    postBoardFinish: (elBoard) => {
        const elBoardsContainer = document.querySelector('.boards')
        document.querySelector('.boards').insertBefore(elBoard, elBoardsContainer.childNodes[2]);
        document.querySelector('.board-form .title input').value = '';
    },
    removeBoard: (boardElement) => {
        boardElement.parentElement.removeChild(boardElement);
    },
    setNodeFormContent: (title, description) => {
        document.querySelector('.nodeform .title input').value = title;
        document.querySelector('.nodeform .desc textarea').value = description;
    }
}