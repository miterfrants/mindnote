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

export const Header = (data, context) => {
    // Header
    const init = async () => {
        gapi.load('client:auth2', async () => {
            await gapi.client.init({
                'apiKey': GOOGLE.AUTH.API_KEY,
                'clientId': GOOGLE.AUTH.CLIENT_ID,
                'scope': GOOGLE.AUTH.SCOPE
            });
            context.GoogleAuth = gapi.auth2.getAuthInstance();
            context.GoogleAuth.isSignedIn.listen(_updateSigninStatus);
            _updateSigninStatus();
        });
        api.init(API, RESPONSE_STATUS);
        _bindEvent();
    }

    const _bindEvent = () => {
        document.querySelector('.btn-logout').addEventListener('click', () => {
            context.GoogleAuth.signOut()
            localStorage.setItem('token', '');
            localStorage.setItem('username', '');
            Route.runFromController(context, location.pathname, Header);
        });

        document.querySelector('.auth-google').addEventListener('click', () => {
            context.GoogleAuth.signIn()
        });
    };

    const _updateSigninStatus = async () => {
        const user = context.GoogleAuth.currentUser.get();
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
                    Route.runFromController(context, location.pathname, Header);
                } else {
                    UI.header.hideAuth();
                    console.warn('error');
                    return;
                }
            }

            UI.setupProfile(user.getBasicProfile().getImageUrl(), user.getBasicProfile().getName())
            UI.header.showAuth();
            // generate boards
            const boards = await api.authApiService.boards.get({
                username,
                token
            });
            UI.header.generateBoards(username, boards.data);
        } else {
            UI.header.hideAuth();
        }
    }

    init();
}