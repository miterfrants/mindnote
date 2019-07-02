import {
    UI
} from '/mindmap/ui.js';

import {
    GOOGLE,
    API,
    RESPONSE_STATUS
} from '/mindmap/config.js';

import {
    api
} from '/mindmap/service/api.v2.js';

import {
    Route
} from '/mindmap/route.js';

export class Header {
    constructor(args, context) {
        this.init(args, context);
        this.run(args, context);
    }
    // Header
    async init(args, context) {
        gapi.load('client:auth2', async () => {
            await gapi.client.init({
                'apiKey': GOOGLE.AUTH.API_KEY,
                'clientId': GOOGLE.AUTH.CLIENT_ID,
                'scope': GOOGLE.AUTH.SCOPE
            });
            this.context.GoogleAuth = gapi.auth2.getAuthInstance();
            this.context.GoogleAuth.isSignedIn.listen((context) => {
                this._updateSigninStatus(context)
            });
            this._updateSigninStatus(context);
        });
        api.init(API, RESPONSE_STATUS);
        this._bindEvent();
    }

    async run(args, context) {
        this.context = context;
        this.self = this;
    }

    _bindEvent() {
        document.querySelector('.btn-logout').addEventListener('click', () => {
            this.context.GoogleAuth.signOut()
            localStorage.setItem('token', '');
            localStorage.setItem('username', '');
            this.context.GoogleAuth.signOut();
            Route.runFromController(this.context, location.pathname, Header);
        });

        document.querySelector('.auth-google').addEventListener('click', () => {
            this.context.GoogleAuth.signIn()
        });

        document.querySelector('.profile').addEventListener('click', () => {
            const menu = document.querySelector('.menu');
            if (menu.classExists('hide')) {
                menu.removeClass('hide')
            } else {
                menu.addClass('hide')
            }
        });
    };

    async _updateSigninStatus() {
        const user = this.context.GoogleAuth.currentUser.get();
        const isGoogleAuthorized = user.hasGrantedScopes(GOOGLE.AUTH.SCOPE);

        if (isGoogleAuthorized) {
            let token = localStorage.getItem('token');
            let username = localStorage.getItem('username');
            if (!token || !username) {
                const result = await api.apiService.auth.post({
                    code: user.getAuthResponse().access_token
                });
                if (result.status === RESPONSE_STATUS.OK) {
                    localStorage.setItem('token', result.data.token);
                    localStorage.setItem('username', result.data.username);
                    token = result.data.token;
                    username = result.data.username;
                    Route.runFromController(this.context, location.pathname, Header);
                } else {
                    UI.header.generateNavigation([])
                    UI.header.hideAuth();
                    console.warn('error');
                    return;
                }
            }

            UI.setupProfile(user.getBasicProfile().getImageUrl(), user.getBasicProfile().getName())
            UI.header.showAuth();
            UI.showAuth();
            // generate boards
            // const boards = await api.authApiService.boards.get({
            //     token,
            //     limit: 5
            // });
            // UI.header.generateBoards(boards.data);
        } else {
            UI.header.hideAuth();
            UI.hideAuth();
            UI.header.generateNavigation([]);
            // refactor: 把所有 html 搬到 component 裡頭去 render
            document.querySelectorAll(`div[class^="router-"]`).forEach((el) => {
                el.addClass('hide');
            })
        }
    }
}