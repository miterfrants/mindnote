export const DATA = {
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
                controller: 'auth',
                action: 'post'
            }, (resp) => {
                if (resp.status === RESPONSE_STATUS.OK) {
                    resolve();
                } else {
                    alert(resp.data.errorMsg);
                    reject();
                }
            });
        });
    },
    postNode: (title, description) => {
        chrome.runtime.sendMessage({
            controller: 'node',
            action: 'post',
            data: {
                title,
                description
            }
        }, (resp) => {
            if (resp.status === 'OK') {
                window.close();
            } else {
                alert(resp.data.errorMsg);
            }
        });
    }
}