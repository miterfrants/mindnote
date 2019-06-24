export const RESPONSE_STATUS = {
    OK: 'OK',
    FAILED: 'FAILED',
};

export const API = {
    ENDPOINT: 'https://sapiens.tools/mindmap/api/v1/',
    AUTHORIZED_CONTROLLER: {
        BOARDS: 'users/{username}/boards/',
        BOARD: 'users/{username}/boards/{uniquename}/',
        NODES: 'users/{username}/boards/{boardUniquename}/nodes/',
        NODE: 'users/{username}/boards/{boardUniquename}/nodes/{nodeId}/',
        RELATIONSHIP: 'users/{username}/boards/{boardUniquename}/relationship/'
    },
    CONTROLLER: {
        NODES: 'boards/{boardUniquename}/nodes/',
        RELATIONSHIP: 'boards/{boardUniquename}/relationship/',
        AUTH: 'auth/'
    }
};