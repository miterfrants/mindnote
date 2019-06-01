var HISTORY_ITEM_TEMPLATE = '<div class="item" data-id="{id}"><div class="title">{title}</div><div class="description">{description}</div></div>';

document.querySelector('.auth-google').addEventListener('click', function () {
    chrome.runtime.sendMessage({
        msg: 'auth'
    });
});

document.querySelector('.btn-logout').addEventListener('click', function () {
    chrome.storage.sync.set({
        token: null,
        userInfo: null,
        history: null,
        selectedNode: null
    }, function () {
        hideAuthSection();
    });
});

function init() {
    chrome.storage.sync.get(['token', 'userInfo', 'history', 'selectedNode'], function (result) {
        if (result.token) {
            hideUnauthSection();
            _setupProfile(result.userInfo);
            generateHistory(result.history);
            generateSelectedNode(result.selectedNode);
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

function _setupProfile(userInfo) {
    document.querySelector('.profile-container').innerHTML = '<img src="' + userInfo.picture + '" />'
    document.querySelector('.name').innerHTML = userInfo.name;
    document.querySelector('.email').innerHTML = userInfo.email;
}

function generateHistory(history) {
    var result = '';
    if (!history) {
        return;
    }
    for (var i = 0; i < history.length; i++) {
        result += HISTORY_ITEM_TEMPLATE.replace(/{title}/gi, history[i].title)
            .replace(/{description}/gi, history[i].description)
            .replace(/{id}/gi, history[i].id)
    }

    document.querySelector('.history').innerHTML = result;
    document.querySelectorAll('.history .item').forEach(function (node) {
        node.addEventListener('click', function (e) {
            const node = {
                id: e.currentTarget.dataset.id,
                title: e.currentTarget.querySelector('.title').innerHTML,
                description: e.currentTarget.querySelector('.description').innerHTML
            };
            generateSelectedNode(node);
            chrome.storage.sync.set({
                selectedNode: node
            });
        });
    });
    document.querySelector('.selected-section').addEventListener('click', function () {
        document.querySelector('.selected-section').innerHTML = '';
        chrome.storage.sync.set({
            selectedNode: null
        });
    });
}

function generateSelectedNode(node) {
    if (node) {
        document.querySelector('.selected-section').innerHTML = HISTORY_ITEM_TEMPLATE.replace(/{title}/gi, node.title)
            .replace(/{description}/gi, node.description)
            .replace(/{id}/gi, node.id)
    }
}