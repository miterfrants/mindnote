let CLIPBOARD_LIMIT, API_ENDPOINT, API_AUTH;
export const extService = {
    init: (clipboardLimit, apiEndpoint, apiAuth) => {
        CLIPBOARD_LIMIT = clipboardLimit;
        API_ENDPOINT = apiEndpoint;
        API_AUTH = apiAuth;
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
                    const resp = await _fetch(API_ENDPOINT + API_AUTH, fetchOption)

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
};