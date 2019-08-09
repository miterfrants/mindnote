export const RESPONSE_STATUS = {
    OK: 'OK',
    FAILED: 'FAILED',
};

export const API = {
    AUTHORIZED: {
        BOARDS: 'users/me/boards/',
        BOARD: 'users/me/boards/{boardId}/',
        NODES: 'users/me/boards/{boardId}/nodes/',
        NODE: 'users/me/boards/{boardId}/nodes/{nodeId}/',
        RELATIONSHIP: 'users/me/boards/{boardId}/relationship/',
        TRANSACTION: 'transaction/',
        ME: 'users/me/',
        IMAGES: 'users/me/images/'
    },
    COMMON: {
        BOARD: 'boards/{boardId}/',
        NODES: 'boards/{boardId}/nodes/',
        NODE: 'boards/{boardId}/nodes/{nodeId}/',
        RELATIONSHIP: 'boards/{boardId}/relationship/'
    },
    AUTHORIZE: 'auth/',
};