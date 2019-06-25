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

export const GOOGLE = {
    AUTH: {
        SCOPE: 'https://www.googleapis.com/auth/userinfo.email',
        API_KEY: 'AIzaSyAP9bT6sbku3mvWDwf3nr7I7E835ahtMwc',
        CLIENT_ID: '675953765772-8q0eqscbosdo7uh1crc00rjjvv6v6o43.apps.googleusercontent.com'
    }
}