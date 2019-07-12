import {
    UserBoard
} from '/mindmap/controller/user-board.js';

import {
    Header
} from '/mindmap/controller/header.js';

import {
    Board
} from '/mindmap/controller/board.js';

import {
    Checkout
} from '/mindmap/controller/checkout.js';

import {
    UserBoards
} from '/mindmap/controller/user-boards.js';

import {
    Me
} from '/mindmap/controller/me.js';

import {
    Test
} from '/mindmap/controller/test/test.js';

import {
    TestBoard
} from '/mindmap/controller/test/board/board.js';

import {
    api
} from '/mindmap/service/api.v2.js';

import {
    RESPONSE_STATUS
} from '/mindmap/config.js';

export const Router = [{
    path: '/mindmap/',
    controller: Header,
    dependency: [{
        url: 'https://apis.google.com/js/api.js',
        checkVariable: 'gapi'
    }],
    prepareData: [{
        key: 'token',
        func: () => {
            return localStorage.getItem('token');
        }
    }, {
        key: 'me',
        func: async (args) => {
            const resp = await api.authApiService.me.get({
                token: args.token
            });
            if (resp.status === RESPONSE_STATUS.OK) {
                return resp.data;
            }
        }
    }],
    Router: [{
        path: 'users/me/',
        controller: Me,
        Router: [{
            path: 'boards/',
            controller: UserBoards
        }, {
            path: 'boards/{boardId}/',
            controller: UserBoard,
            dependency: [{
                url: '/mindmap/third-party/cyto/cytoscape.min.js',
                checkVariable: 'cytoscape'
            }, {
                url: 'https://cdnjs.cloudflare.com/ajax/libs/markdown-it/8.4.2/markdown-it.min.js',
                checkVariable: 'markdownit'
            }]
        }]
    }, {
        path: 'boards/{boardId}/',
        controller: Board,
        dependency: [{
            url: '/mindmap/third-party/cyto/cytoscape.min.js',
            checkVariable: 'cytoscape'
        }, {
            url: 'https://cdnjs.cloudflare.com/ajax/libs/markdown-it/8.4.2/markdown-it.min.js',
            checkVariable: 'markdownit'
        }]
    }, {
        path: 'checkout/',
        controller: Checkout,
        // 如果 parent prepareData funcs 發生錯誤，這個 controller 就不會執行
        isRequiredParentPrepareData: true,
        dependency: [{
            url: 'https://js.tappaysdk.com/tpdirect/v5.1.0',
            checkVariable: 'TPDirect'
        }],
    }, {
        path: 'test/',
        controller: Test,
        html: '/mindmap/controller/test/test.html',
        Router: [{
            path: 'board/',
            controller: TestBoard,
            html: '/mindmap/controller/test/board/board.html',
        }]
    }]
}]