/**
 * Controller
 */
export const controller = {
    boards: {
        get: async (data, sendResponse) => {
            let api = API.ENDPOINT + API.CONTROLLER.BOARDS;
            api = api.bind(data);
            let fetchOption = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + data.token
                }
            };
            const resp = await _fetch(api, fetchOption);

            if (resp.status === 200) {
                const boards = await resp.json();
                sendResponse({
                    status: RESPONSE_STATUS.OK,
                    data: [
                        ...boards,
                    ]
                });
            } else {
                sendResponse({
                    status: RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'get board failed:' + JSON.stringify(resp)
                    }
                });
            }
        }
    },
    board: {
        post: async (data, sendResponse) => {
            let api = API.ENDPOINT + API.CONTROLLER.BOARDS;
            api = api.bind(data);
            const postBody = {
                title: data.title,
                uniquename: data.uniquename
            }
            const fetchOption = {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + data.token
                },
                body: JSON.stringify(postBody)
            };
            const resp = await _fetch(api, fetchOption);
            if (resp.status === 200) {
                const board = await resp.json();
                sendResponse({
                    status: RESPONSE_STATUS.OK,
                    data: {
                        ...board,
                    }
                });
            } else {
                sendResponse({
                    status: RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'get board failed:' + JSON.stringify(resp)
                    }
                });
            }
        },
        delete: async (data, sendResponse) => {
            let api = API.ENDPOINT + API.CONTROLLER.BOARD;
            api = api.bind(data);
            const fetchOption = {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + data.token
                }
            };
            const resp = await _fetch(api, fetchOption);
            if (resp.status === 200) {
                sendResponse({
                    status: RESPONSE_STATUS.OK
                });
            } else {
                sendResponse({
                    status: RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'delete board failed:' + JSON.stringify(resp)
                    }
                });
            }
        },
        patch: async (data, sendResponse) => {
            let api = API.ENDPOINT + API.CONTROLLER.BOARD;
            api = api.bind(data);
            const fetchOption = {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + data.token
                },
                body: JSON.stringify({
                    title: data.title,
                    uniquename: data.uniquename,
                    is_public: data.is_public
                })
            };
            const resp = await _fetch(api, fetchOption);
            if (resp.status === 200) {
                const board = await resp.json();
                sendResponse({
                    status: RESPONSE_STATUS.OK,
                    data: board
                });
            } else {
                sendResponse({
                    status: RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'public board failed:' + JSON.stringify(resp)
                    }
                });
            }
        }
    },
    node: {
        post: async (data, sendResponse) => {
            // validation 
            if (!data.selectedBoard) {
                alert('Please select a board');
            }

            let apiNode = API.ENDPOINT + API.CONTROLLER.NODE;
            apiNode = apiNode.bind(data).replace(/{boardUniquename}/gi, data.selectedBoard.uniquename);
            let postBody = {
                title: data.title,
                description: data.description
            };

            if (data.selectedNode) {
                postBody['parent_node_id'] = data.selectedNode.id
            }

            let fetchOption = {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + data.token
                },
                body: JSON.stringify(postBody)
            };
            const resp = await _fetch(apiNode, fetchOption)

            if (resp.status === 200) {
                const data = await resp.json();
                appendNodeHistory(data);
                sendResponse({
                    status: RESPONSE_STATUS.OK,
                    data
                });
            } else {
                sendResponse({
                    status: RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'create post failed'
                    }
                });
            }
        }
    },
    auth: {
        post: async (data, sendResponse) => {
            const resp = await new Promise(function (resolve, reject) {
                chrome.identity.getAuthToken({
                    'interactive': true
                }, async (code) => {
                    // check token is validated
                    const fetchOption = {
                        method: 'POST',
                        body: JSON.stringify({
                            code: code
                        })
                    };
                    const resp = await _fetch(API.ENDPOINT + API.CONTROLLER.AUTH, fetchOption)

                    if (resp.status === 200) {
                        const userInfo = await resp.json();
                        const token = userInfo.token;
                        delete userInfo.token;
                        resolve({
                            status: RESPONSE_STATUS.OK,
                            data: {
                                token: token,
                                userInfo: userInfo
                            }
                        });
                    } else {
                        resolve({
                            status: RESPONSE_STATUS.FAILED,
                            data: {
                                errorMsg: 'auth fail'
                            }
                        });
                    }
                });
            });
            setToken(resp.data.token, resp.data.userInfo);
            sendResponse(resp);
        },
        get: async (data, sendResponse) => {
            const token = await new Promise(function (resolve, reject) {
                chrome.storage.sync.get(['token'], (storage) => {
                    resolve(storage.token);
                });
            });
            sendResponse({
                status: RESPONSE_STATUS.OK,
                data: {
                    token
                }
            });
        }
    },
    clipboard: {
        get: async (data, sendResponse) => {
            const clipboard = await new Promise(function (resolve, reject) {
                chrome.storage.sync.get(['clipboard'], (storage) => {
                    resolve(storage.clipboard);
                });
            });
            sendResponse({
                status: RESPONSE_STATUS.OK,
                data: {
                    clipboard: clipboard
                }
            });
        },

        unshift: async (data) => {
            let clipboard = await new Promise(function (resolve, reject) {
                chrome.storage.sync.get(['clipboard'], (storage) => {
                    resolve(storage.clipboard);
                });
            });
            if (clipboard === null || clipboard === undefined) {
                clipboard = [];
            }
            clipboard.splice(CLIPBOARD_LIMIT);
            clipboard.unshift(data.text);
            chrome.storage.sync.set({
                clipboard
            });
        }
    }
}

const _fetch = (url, option, withCatch) => {
    if (option.cache) {
        console.warn('Cound not declate cache in option params');
    }
    const newOption = {
        ...option,
        headers: {
            ...option.headers,
            'Content-Type': 'application/json'
        }
    }
    if (!withCatch) {
        newOption['cache'] = 'no-cache';
    } else {
        newOption['cache'] = 'cache';
    }
    return fetch(url, newOption);
}

const setToken = (token, userInfo) => {
    chrome.storage.sync.set({
        token: token,
        userInfo: userInfo
    });
}

const appendNodeHistory = (node) => {
    chrome.storage.sync.get(['history'], function (data) {
        let history = data.history
        if (!history || !Array.isArray(history)) {
            history = [];
        }
        history.unshift(node);
        history.splice(NODE_HISTORY_LIMIT);
        chrome.storage.sync.set({
            history
        });
    })
}