let RESPONSE_STATUS;
(async () => {
    const extendedPrototype = (await import(chrome.extension.getURL('/util/extended-prototype.js')));
    extendedPrototype.extendHTMLElementProtoType();
    extendedPrototype.extendStringProtoType();
    RESPONSE_STATUS = (await import(chrome.extension.getURL('/util/constant.js'))).RESPONSE_STATUS;

    const arrayOfQueryString = location.search.replace(/\?/gi, '').split('&');
    let text = '';
    for (var i = 0; i < arrayOfQueryString.length; i++) {
        if (arrayOfQueryString[i].indexOf('text=') !== -1) {
            text = arrayOfQueryString[i].split('=')[1];
        }
    }

    app.run(text);
})();

const app = {
    run: async (textSelection) => {
        // build a dialog and show 
        const resp = await app.checkAuthAsync();
        if (resp.data.token) {
            document.querySelector('.auth').removeClass('hide');
            document.querySelector('.unauth').addClass('hide');
        } else {
            document.querySelector('.auth').addClass('hide');
            document.querySelector('.unauth').removeClass('hide');
        }
        // event listener
        document.querySelector('.btn-close').addEventListener('click', app.removeDialog);
        document.querySelector('.btn-create').addEventListener('click', app.postNode);
        document.querySelector('.auth-google').addEventListener('click', () => {
            authAsync();
        })
        document.body.addEventListener('keydown', function (event) {
            if (event.keyCode === 27) {
                app.removeDialog();
            }
        });
        // fill text to input
        var titleInput = document.querySelector('.title input');
        titleInput.value = textSelection;
        titleInput.focus();
        document.querySelector('.description textarea').innerHTML = textSelection;

        const clipboardContainer = document.querySelector('.clipbaord > .content');
        chrome.runtime.sendMessage({
            controller: 'clipboard',
            action: 'get'
        }, (resp) => {
            for (var i = 0; i < resp.data.clipboard.length; i++) {
                const div = document.createElement('div');
                div.innerHTML = resp.data.clipboard[i]
                clipboardContainer.appendChild(div);
            }
        });

        chrome.runtime.sendMessage({
            controller: 'relation',
            action: 'get'
        }, (resp) => {
            if (resp.data.board !== null && resp.data.node === null) {
                document.querySelector('.selected-node').addClass('hide');
                document.querySelector('.selected-board').removeClass('hide');
                document.querySelector('.warning').addClass('hide');
                document.querySelector('.selected-board > .content').innerHTML = resp.data.board.title;
            } else if (resp.data.board !== null && resp.data.node !== null) {
                document.querySelector('.selected-node').removeClass('hide');
                document.querySelector('.selected-board').removeClass('hide');
                document.querySelector('.warning').addClass('hide');
                document.querySelector('.selected-board > .content').innerHTML = resp.data.board.title;
                document.querySelector('.selected-node > .content').innerHTML = resp.data.node.title;
            } else {
                document.querySelector('.warning').removeClass('hide');
                document.querySelector('.selected-node').addClass('hide');
                document.querySelector('.selected-board').addClass('hide');
            }
        })
    },
    authAsync: () => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({
                controller: 'auth',
                action: 'check'
            }, (resp) => {
                if (resp.status === RESPONSE_STATUS.OK) {
                    resolve(resp);
                } else {
                    alert(resp.data.errorMsg);
                    reject();
                }
            });
        });
    },
    checkAuthAsync: () => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({
                controller: 'auth',
                action: 'get'
            }, (resp) => {
                if (resp.status === RESPONSE_STATUS.OK) {
                    resolve(resp);
                } else {
                    alert(resp.data.errorMsg);
                    reject();
                }
            });
        });
    },
    postNode: () => {
        var title = document.querySelector('.title input').value,
            description = document.querySelector('.description textarea').value;
        chrome.runtime.sendMessage({
            controller: 'node',
            action: 'post',
            data: {
                title,
                description
            }
        }, (resp) => {
            if (resp.status === 'OK') {
                app.removeDialog();
            } else {
                alert(resp.data.errorMsg);
            }
        });

    },
    removeDialog: () => {
        window.close();
    }
}

const UI = {
    setupCurrentBoard: (currentBoard) => {
        if (currentBoard && currentBoard.length > 0) {
            document.querySelector('.current-board').removeClass('hide');
            document.querySelector('.current-board>content').innerHTML = currentBoard
        } else {
            document.querySelector('.current-board').addClass('hide');
        }
    }
}