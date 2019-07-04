export const RESPONSE_STATUS = {
    OK: 'OK',
    FAILED: 'FAILED',
};

export const API = {
    ENDPOINT: 'https://dev.sapiens.tools:8082/mindmap/api/v1/',
    AUTHORIZED: {
        BOARDS: 'users/me/boards/',
        BOARD: 'users/me/boards/{boardId}/',
        NODES: 'users/me/boards/{boardId}/nodes/',
        NODE: 'users/me/boards/{boardId}/nodes/{nodeId}/',
        RELATIONSHIP: 'users/me/boards/{boardId}/relationship/',
        TRANSACTION: 'transaction/',
        ME: 'users/me/'
    },
    COMMON: {
        NODES: 'boards/{boardId}/nodes/',
        RELATIONSHIP: 'boards/{boardId}/relationship/'
    },
    AUTHORIZE: 'auth/'
};

export const GOOGLE = {
    AUTH: {
        SCOPE: 'https://www.googleapis.com/auth/userinfo.email',
        API_KEY: 'AIzaSyAP9bT6sbku3mvWDwf3nr7I7E835ahtMwc',
        CLIENT_ID: '675953765772-8q0eqscbosdo7uh1crc00rjjvv6v6o43.apps.googleusercontent.com'
    }
}