let _API, _RESPONSE_STATUS;
import { extendStringProtoType } from 'https://sapiens.tools/mindmap/util/extended-prototype.js';
extendStringProtoType();

export const authApiService = {
    /**
     * @param {object} API
     * @param {string} API.ENDPOINT
     * @param {object} API.AUTHORIZED_CONTROLLER
     * @param {string} API.AUTHORIZED_CONTROLLER.BOARDS
     * @param {string} API.AUTHORIZED_CONTROLLER.BOARD
     * @param {string} API.AUTHORIZED_CONTROLLER.NODES
     * @param {object} RESPONSE_STATUS
     * @param {string} RESPONSE_STATUS.OK
     * @param {string} RESPONSE_STATUS.FAILED
     */
    init: (API, RESPONSE_STATUS) => {
        _API = API;
        _RESPONSE_STATUS = RESPONSE_STATUS;
    },
    boards: {
        post: async (data, sendResponse) => {
            let api = _API.ENDPOINT + _API.AUTHORIZED_CONTROLLER.BOARDS;
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
                    status: _RESPONSE_STATUS.OK,
                    data: {
                        ...board,
                    }
                });
            } else {
                sendResponse({
                    status: _RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'get board failed:' + JSON.stringify(resp)
                    }
                });
            }
        },
        get: async (data, sendResponse) => {
            let api = _API.ENDPOINT + _API.AUTHORIZED_CONTROLLER.BOARDS;
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
                    status: _RESPONSE_STATUS.OK,
                    data: [
                        ...boards,
                    ]
                });
            } else {
                sendResponse({
                    status: _RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'get board failed:' + JSON.stringify(resp)
                    }
                });
            }
        }
    },
    board: {
        delete: async (data, sendResponse) => {
            let api = _API.ENDPOINT + _API.AUTHORIZED_CONTROLLER.BOARD;
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
                    status: _RESPONSE_STATUS.OK
                });
            } else {
                sendResponse({
                    status: _RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'delete board failed:' + JSON.stringify(resp)
                    }
                });
            }
        },
        patch: async (data, sendResponse) => {
            let api = _API.ENDPOINT + _API.AUTHORIZED_CONTROLLER.BOARD;
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
                    status: _RESPONSE_STATUS.OK,
                    data: board
                });
            } else {
                sendResponse({
                    status: _RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'public board failed:' + JSON.stringify(resp)
                    }
                });
            }
        }
    },
    nodes: {
        get: async (data, sendResponse) => {
            let apiNode = _API.ENDPOINT + _API.AUTHORIZED_CONTROLLER.NODES;
            apiNode = apiNode.bind(data);
            let fetchOption = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + data.token
                }
            };
            const resp = await _fetch(apiNode, fetchOption)

            if (resp.status === 200) {
                const data = await resp.json();
                return {
                    status: _RESPONSE_STATUS.OK,
                    data
                };
            } else {
                return {
                    status: _RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'get nodes failed'
                    }
                };
            }
        },
        post: async (data, sendResponse) => {
            // validation 
            if (!data.selectedBoard) {
                sendResponse({
                    status: _RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'Please select a board'
                    }
                });
                return;
            }

            let apiNode = _API.ENDPOINT + _API.AUTHORIZED_CONTROLLER.NODES;
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
                sendResponse({
                    status: _RESPONSE_STATUS.OK,
                    data
                });
            } else {
                sendResponse({
                    status: _RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'create post failed'
                    }
                });
            }
        }
    },
    relationship: {
        get: async (data, sendResponse) => {
            let apiNode = _API.ENDPOINT + _API.AUTHORIZED_CONTROLLER.RELATIONSHIP;
            apiNode = apiNode.bind(data);
            let fetchOption = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + data.token
                }
            };
            const resp = await _fetch(apiNode, fetchOption)

            if (resp.status === 200) {
                const data = await resp.json();
                return {
                    status: _RESPONSE_STATUS.OK,
                    data
                };
            } else {
                return {
                    status: _RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'get relationship of node failed'
                    }
                };
            }
        }
    }
}

export const apiService = {
    nodes: {
        get: async (data) => {
            let url = _API.ENDPOINT + _API.CONTROLLER.NODES;
            url = url.bind(data);
            const resp = await fetch(url)
            if (resp.status === 200) {
                const data = await resp.json();
                return {
                    status: _RESPONSE_STATUS.OK,
                    data
                };
            } else {
                return {
                    status: _RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'get nodes failed'
                    }
                };
            }
        }
    },
    relationship: {
        get: async (data) => {
            let url = _API.ENDPOINT + _API.CONTROLLER.RELATIONSHIP;
            url = url.bind(data);
            const resp = await fetch(url)
            if (resp.status === 200) {
                const data = await resp.json();
                return {
                    status: _RESPONSE_STATUS.OK,
                    data
                };
            } else {
                return {
                    status: _RESPONSE_STATUS.FAILED,
                    data: {
                        errorMsg: 'get relationship of node failed'
                    }
                };
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