let _API, _RESPONSE_STATUS;
import {
    extendStringProtoType
} from '/mindmap/util/extended-prototype.js';
extendStringProtoType();

window['MindMapApiCache'] = {};

export const api = {
    /**
     * @param {object} API
     * @param {string} API.ENDPOINT
     * @param {object} API.AUTHORIZED
     * @param {string} API.AUTHORIZED.BOARDS
     * @param {string} API.AUTHORIZED.BOARD
     * @param {string} API.AUTHORIZED.NODES
     * @param {object} RESPONSE_STATUS
     * @param {string} RESPONSE_STATUS.OK
     * @param {string} RESPONSE_STATUS.FAILED
     */
    init: (API, RESPONSE_STATUS) => {
        _API = API;
        _RESPONSE_STATUS = RESPONSE_STATUS;
    },
    authApiService: {
        boards: {
            post: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.BOARDS;
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
                return _handleRequest(api, fetchOption, sendResponse);
            },
            get: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.BOARDS;
                api = api.bind(data);

                if (data.limit) {
                    api += '?limit=' + data.limit;
                }

                let fetchOption = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse);
            }
        },
        board: {
            get: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.BOARD;
                api = api.bind(data);
                const fetchOption = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse);
            },
            delete: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.BOARD;
                api = api.bind(data);
                const fetchOption = {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse);
            },
            patch: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.BOARD;
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
                return _handleRequest(api, fetchOption, sendResponse);
            }
        },
        node: {
            patch: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.NODE;
                api = api.bind(data);
                const fetchOption = {
                    method: 'PATCH',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify({
                        title: data.title,
                        description: data.description
                    })
                };
                return _handleRequest(api, fetchOption, sendResponse);
            },
            delete: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.NODE;
                api = api.bind(data);
                const fetchOption = {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse);
            }
        },
        nodes: {
            get: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.NODES;
                api = api.bind(data);
                let fetchOption = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse);
            },
            post: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.NODES;
                api = api.bind(data);
                let postBody = {
                    title: data.title,
                    description: data.description
                };

                let fetchOption = {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify(postBody)
                };
                return _handleRequest(api, fetchOption, sendResponse);
            }
        },
        relationship: {
            get: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.RELATIONSHIP;
                api = api.bind(data);
                let fetchOption = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse);
            },
            post: async (data, sendResponse) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.RELATIONSHIP;
                api = api.bind(data);

                let postBody = {
                    parent_node_id: data.parent_node_id,
                    child_node_id: data.child_node_id
                };

                let fetchOption = {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify(postBody)
                };
                return _handleRequest(api, fetchOption, sendResponse);
            }
        }
    },
    apiService: {
        nodes: {
            get: async (data) => {
                let api = _API.ENDPOINT + _API.COMMON.NODES;
                api = api.bind(data);
                return _handleRequest(api, {});
            }
        },
        relationship: {
            get: async (data) => {
                let api = _API.ENDPOINT + _API.COMMON.RELATIONSHIP;
                api = api.bind(data);
                return _handleRequest(api, {});
            }
        },
        auth: {
            post: async (data) => {
                // check token is validated
                const fetchOption = {
                    method: 'POST',
                    body: JSON.stringify({
                        code: data.code
                    }),
                };
                const api = _API.ENDPOINT + _API.AUTHORIZE;
                return _handleRequest(api, fetchOption);
            }
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

const _handleRequest = (api, fetchOption, sendResponse) => {
    return new Promise(async (resolve, reject) => {
        let result;
        // if (
        //     fetchOption.method === 'GET' &&
        //     MindMapApiCache[api] !== undefined &&
        //     MindMapApiCache[api][JSON.stringify(fetchOption)] !== undefined
        // ) {
        //     result = MindMapApiCache[api][JSON.stringify(fetchOption)];
        //     if (sendResponse) {
        //         sendResponse(result);
        //     }
        //     resolve(result);
        //     return;
        // }

        // if (
        //     fetchOption.method !== 'GET'
        // ) {
        //     for (let cacheKey in MindMapApiCache) {
        //         if (api.indexOf(cacheKey) === 0) {
        //             delete MindMapApiCache[cacheKey];
        //         }
        //     }
        // }
        let resp
        try {
            resp = await _fetch(api, fetchOption);
        } catch (error) {
            result = {
                status: _RESPONSE_STATUS.FAILED,
                data: {
                    errorMsg: error
                }
            }
            if (sendResponse) {
                sendResponse(result);
            }
            resolve(result);
            return;
        }
        if (resp.status === 200) {
            const jsonData = await resp.json();
            result = {
                status: _RESPONSE_STATUS.OK,
                data: jsonData
            };
            if (fetchOption.method === 'GET') {
                MindMapApiCache[api] = MindMapApiCache[api] || {};
                MindMapApiCache[api][JSON.stringify(fetchOption)] = result;
            }
        } else {
            const jsonData = await resp.json();
            result = {
                status: _RESPONSE_STATUS.FAILED,
                data: {
                    errorMsg: 'network error: ' + jsonData.data.message
                }
            };
        }
        if (sendResponse) {
            sendResponse(result);
        }
        resolve(result);
    });
};