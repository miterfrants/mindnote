import {
    RESPONSE_STATUS
} from '/config.js';
export const DATA = {
    getBoardsAsync: () => {
        return new Promise(function (resolve) {
            chrome.runtime.sendMessage({
                service: 'authApiService',
                module: 'boards',
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
    postBoardAsync: (formData) => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({
                service: 'authApiService',
                module: 'boards',
                action: 'post',
                data: formData
            }, async (resp) => {
                if (resp.status === RESPONSE_STATUS.OK) {
                    resolve(resp);
                } else {
                    resolve(resp);
                }
            });
        });
    },
    deleteBoardAsync: (formData, board) => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({
                service: 'authApiService',
                module: 'board',
                action: 'delete',
                data: formData
            }, function (resp) {
                if (resp.status === RESPONSE_STATUS.OK) {
                    resolve(resp);
                } else {
                    alert(resp.data.errorMsg);
                    reject();
                }
            })
        })
    },
    changeBoardPermissionAsync: (formData) => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({
                service: 'authApiService',
                module: 'board',
                action: 'patch',
                data: {
                    ...formData,
                    boardId: formData.id
                }
            }, async (resp) => {
                if (resp.status === RESPONSE_STATUS.OK) {
                    resolve(resp.data);
                } else {
                    alert(resp.data.errorMsg);
                    reject();
                }
            });
        })
    },
    authAsync: () => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({
                service: 'extService',
                module: 'auth',
                action: 'post'
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
    postNodeAsync: (boardId, title, description) => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({
                service: 'authApiService',
                module: 'nodes',
                action: 'post',
                data: {
                    boardId,
                    title,
                    description
                }
            }, (resp) => {
                if (resp.status === 'OK') {
                    resolve(resp);
                } else {
                    alert(resp.data.errorMsg);
                    reject();
                }
            });
        });
    },
    popupCheckout: (data) => {
        chrome.runtime.sendMessage({
            service: 'extService',
            module: 'popup',
            action: 'checkout',
            data,
        });
    }
}