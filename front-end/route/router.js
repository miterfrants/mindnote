import {
    Main
} from '/mindnote/controller/main/main.js';

import {
    Me
} from '/mindnote/controller/main/me/me.js';

import {
    MyBoards
} from '/mindnote/controller/main/me/boards/my-boards.js';

import {
    MyBoard
} from '/mindnote/controller/main/me/board/my-board.js';

import {
    Board
} from '/mindnote/controller/main/board/board.js';

import {
    Checkout
} from '/mindnote/controller/main/checkout/checkout.js';

import {
    api
} from '/mindnote/service/api.v2.js';

import {
    RESPONSE_STATUS
} from '/mindnote/config.js';

import {
    RequireLogin
} from '/mindnote/controller/main/util/redirect/require-login.js';

import {
    RequireBoards
} from '/mindnote/controller/main/util/redirect/require-boards.js';

export const Router = [{
    path: '/mindnote/',
    controller: Main,
    html: '/mindnote/controller/main/main.html',
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
        path: 'require-login/',
        controller: RequireLogin,
        html: '/controller/main/util/redirect/require-login.html'
    }, {
        path: 'require-boards/',
        controller: RequireBoards
    }, {
        path: 'users/me/',
        controller: Me,
        Router: [{
            path: 'boards/',
            controller: MyBoards,
            html: '/mindnote/controller/main/me/boards/my-boards.html'
        }, {
            path: 'boards/{boardId}/',
            controller: MyBoard,
            html: '/mindnote/controller/main/me/board/my-board.html',
            dependency: [{
                url: '/mindnote/third-party/cyto/cytoscape.min.js',
                checkVariable: 'cytoscape'
            }, {
                url: 'https://cdnjs.cloudflare.com/ajax/libs/markdown-it/8.4.2/markdown-it.min.js',
                checkVariable: 'markdownit'
            }]
        }]
    }, {
        path: 'boards/{boardId}/',
        controller: Board,
        html: '/mindnote/controller/main/board/board.html',
        dependency: [{
            url: '/mindnote/third-party/cyto/cytoscape.min.js',
            checkVariable: 'cytoscape'
        }, {
            url: 'https://cdnjs.cloudflare.com/ajax/libs/markdown-it/8.4.2/markdown-it.min.js',
            checkVariable: 'markdownit'
        }]
    }, {
        path: 'checkout/',
        controller: Checkout,
        html: '/mindnote/controller/main/checkout/checkout.html',
        // 如果 parent prepareData funcs 發生錯誤，這個 controller 就不會執行
        isRequiredParentPrepareData: true,
        dependency: [{
            url: 'https://js.tappaysdk.com/tpdirect/v5.1.0',
            checkVariable: 'TPDirect'
        }],
    }]
}]