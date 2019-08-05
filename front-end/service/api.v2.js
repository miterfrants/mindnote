let _API, _RESPONSE_STATUS;
import {
    extendStringProtoType
} from '/mindnote/util/extended-prototype.js';
extendStringProtoType();

if (!window['MindnoteApiCache']) {
    window['MindnoteApiCache'] = {};
}

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
    initV2: (ENDPOINT, API, RESPONSE_STATUS) => {
        _API = API;
        _API.ENDPOINT = ENDPOINT;
        _RESPONSE_STATUS = RESPONSE_STATUS;
    },
    authApiService: {
        images: {
            post: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.IMAGES;
                api = api.bind(data);

                const requestBody = {
                    base64Files: data.base64Files
                };

                const fetchOption = {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify(requestBody)
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            }
        },
        me: {
            get: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.ME;

                api = api.bind(data);
                let fetchOption = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            }
        },
        boards: {
            post: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.BOARDS;
                api = api.bind(data);
                const postBody = {
                    title: data.title,
                    uniquename: data.uniquename
                };
                const fetchOption = {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify(postBody)
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            },
            get: async (data, sendResponse, withoutCache) => {
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
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            }
        },
        board: {
            get: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.BOARD;
                api = api.bind(data);
                const fetchOption = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            },
            delete: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.BOARD;
                api = api.bind(data);
                const fetchOption = {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            },
            patch: async (data, sendResponse, withoutCache) => {
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
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            }
        },
        node: {
            patch: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.NODE;
                api = api.bind(data);

                const requestBody = {};

                if (data.title !== null && data.title !== undefined) {
                    requestBody.title = data.title;
                }
                if (data.description !== null && data.description !== undefined) {
                    requestBody.description = data.description;
                }
                if (data.x !== null && data.x !== undefined) {
                    requestBody.x = data.x;
                }
                if (data.y !== null && data.y !== undefined) {
                    requestBody.y = data.y;
                }
                if (data.cover !== null && data.cover !== undefined) {
                    requestBody.cover = data.cover;
                }

                const fetchOption = {
                    method: 'PATCH',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify(requestBody)
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            },
            delete: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.NODE;
                api = api.bind(data);
                const fetchOption = {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            }
        },
        nodes: {
            get: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.NODES;
                api = api.bind(data);
                let fetchOption = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            },
            post: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.NODES;
                api = api.bind(data);
                let postBody = {
                    title: data.title,
                    description: data.description
                };

                if (data.parent_node_id) {
                    postBody.parent_node_id = data.parent_node_id;
                }

                let fetchOption = {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify(postBody)
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            },
            patch: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.NODES;
                api = api.bind(data);
                let requestBody = {
                    nodes: data.nodes
                };

                if (data.parent_node_id) {
                    requestBody.parent_node_id = data.parent_node_id;
                }

                let fetchOption = {
                    method: 'PATCH',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify(requestBody)
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            },
            delete: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.NODES;
                api = api.bind(data);
                let requestBody = {
                    nodeIds: data.nodeIds
                };

                let fetchOption = {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify(requestBody)
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            }
        },
        relationship: {
            get: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.RELATIONSHIP;
                api = api.bind(data);
                let fetchOption = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            },
            post: async (data, sendResponse, withoutCache) => {
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
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            },
            delete: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.RELATIONSHIP;
                api = api.bind(data);

                let requestBody = {
                    relationshipIds: data.relationshipIds
                };

                let fetchOption = {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify(requestBody)
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            }
        },
        transaction: {
            post: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.TRANSACTION;
                api = api.bind(data);

                let postBody = {
                    prime: data.prime,
                    phone: data.phone,
                    email: data.email,
                    card_holder: data.card_holder
                };

                let fetchOption = {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    },
                    body: JSON.stringify(postBody)
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            },
            delete: async (data, sendResponse, withoutCache) => {
                let api = _API.ENDPOINT + _API.AUTHORIZED.TRANSACTION;

                let fetchOption = {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                };
                return _handleRequest(api, fetchOption, sendResponse, withoutCache);
            }
        }
    },
    apiService: {
        board: {
            get: async (data) => {
                let api = _API.ENDPOINT + _API.COMMON.BOARD;
                api = api.bind(data);
                return _handleRequest(api, {
                    method: 'GET'
                });
            }
        },
        nodes: {
            get: async (data) => {
                let api = _API.ENDPOINT + _API.COMMON.NODES;
                api = api.bind(data);
                return _handleRequest(api, {
                    method: 'GET'
                });
            }
        },
        relationship: {
            get: async (data) => {
                let api = _API.ENDPOINT + _API.COMMON.RELATIONSHIP;
                api = api.bind(data);
                return _handleRequest(api, {
                    method: 'GET'
                });
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
};

const _fetch = (url, option) => {
    if (option.cache) {
        console.warn('Cound not declate cache in option params');
    }
    const newOption = {
        ...option,
        headers: {
            ...option.headers,
            'Content-Type': 'application/json'
        }
    };
    return fetch(url, newOption);
};

const _handleRequest = (api, fetchOption, sendResponse, withoutCache) => {
    return new Promise(async (resolve) => { // eslint-disable-line
        let result;
        const newOption = {
            ...fetchOption
        };
        delete newOption.headers;
        if (
            fetchOption.method === 'GET' &&
            window.MindnoteApiCache[api] !== undefined &&
            window.MindnoteApiCache[api][JSON.stringify(newOption)] !== undefined &&
            withoutCache !== true
        ) {
            result = window.MindnoteApiCache[api][JSON.stringify(newOption)];
            if (sendResponse) {
                sendResponse(result);
            }
            resolve(result);
            return;
        }

        if (
            fetchOption.method !== 'GET'
        ) {
            // refactor 現在的做法是只要發生 http method 不是 get 就把整個 cache 清掉，未來的作法應該是 API Response 會對應到 client 端 DB
            window.MindnoteApiCache = {};
        }
        let resp;
        try {
            resp = await _fetch(api, fetchOption, withoutCache);
        } catch (error) {
            result = {
                status: _RESPONSE_STATUS.FAILED,
                data: {
                    errorMsg: error
                }
            };
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
                httpStatus: resp.status,
                data: jsonData
            };
            if (fetchOption.method === 'GET') {
                window.MindnoteApiCache[api] = window.MindnoteApiCache[api] || {}; // eslint-disable-line
                const newOption = {
                    ...fetchOption
                };
                delete newOption.headers;
                window.MindnoteApiCache[api][JSON.stringify(newOption)] = result; // eslint-disable-line
            }
        } else {
            const jsonData = await resp.json();
            result = {
                status: _RESPONSE_STATUS.FAILED,
                httpStatus: resp.status,
                data: {
                    errorMsg: jsonData.data.message
                }
            };
        }
        if (sendResponse) {
            sendResponse(result);
        }
        resolve(result);
    });
};