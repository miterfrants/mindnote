const env = 'prod'; // dev or prod
const apiEndPoint = env === 'dev' ? 'https://dev.sapiens.tools:8082/' : 'https://sapiens.tools/';
export const remoteEndpoint = env === 'dev' ? 'https://dev.sapiens.tools/' : 'https://sapiens.tools/';

export const NODE_HISTORY_LIMIT = 5;
export const CLIPBOARD_LIMIT = 10;
export const REMOTE_LIB_API_SERVICE = remoteEndpoint + 'mindnote/service/api.v2.js';
export const RESPONSE_STATUS = {
    OK: 'OK',
    FAILED: 'FAILED',
};
export const API = {
    ENDPOINT: apiEndPoint + 'mindnote/api/v1/',
    AUTHORIZED: {
        USER: 'users/',
        BOARDS: 'users/me/boards/',
        BOARD: 'users/me/boards/{boardId}/',
        NODES: 'users/me/boards/{boardId}/nodes/',
    },
    AUTHORIZE: 'auth/'
};