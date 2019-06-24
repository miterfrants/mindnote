export const RESPONSE_STATUS = {
    OK: 'OK',
    FAILED: 'FAILED',
};

export const API = {
    ENDPOINT: 'https://sapiens.tools/mindmap/api/v1/',
    AUTHORIZED_CONTROLLER: {
        USER: 'users/',
        BOARDS: 'users/{username}/boards/',
        BOARD: 'users/{username}/boards/{uniquename}/',
        NODES: 'users/{username}/boards/{boardUniquename}/nodes/',
        AUTH: 'auth/'
    }
};

export const NODE_HISTORY_LIMIT = 5;
export const CLIPBOARD_LIMIT = 10;