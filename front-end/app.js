import {
    UI
} from '/mindmap/ui.js';
import {
    DATA
} from '/mindmap/data.js';
import {
    Route
} from '/mindmap/router.js';
import {
    GOOGLE,
    RESPONSE_STATUS,
    API
} from '/mindmap/config.js';
import {
    api
} from '/mindmap/service/api.v2.js';

// double tap node will trigger `double-tap-node` event
export const APP = {
    googleAuth: null,
    run: (preloadLibs) => {
        for (let i = 0; i < preloadLibs.length; i++) {
            const script = document.createElement('script');
            script.src = preloadLibs[i].url;
            document.body.appendChild(script);
        }

        const check = () => {
            let isReady = true;
            for (let i = 0; i < preloadLibs.length; i++) {
                if (!window[preloadLibs[i].checkVariable]) {
                    isReady = false;
                    break;
                }
            }
            if (isReady) {
                APP.init();
            } else {
                setTimeout(check, 10);
            }
        }

        check();
    },
    init: () => {
        Route.init();
        gapi.load('client:auth2', async () => {
            await gapi.client.init({
                'apiKey': GOOGLE.AUTH.API_KEY,
                'clientId': GOOGLE.AUTH.CLIENT_ID,
                'scope': GOOGLE.AUTH.SCOPE
            });
            APP.googleAuth = gapi.auth2.getAuthInstance();
            APP.googleAuth.isSignedIn.listen(APP.updateSigninStatus);
            APP._updateSigninStatus();
        });
        api.init(API, RESPONSE_STATUS);
    },
    _updateSigninStatus: async () => {
        const user = APP.googleAuth.currentUser.get();
        const isGoogleAuthorized = user.hasGrantedScopes(GOOGLE.AUTH.SCOPE);

        if (isGoogleAuthorized) {
            const result = await api.apiService.auth.post({
                code: user.getAuthResponse().access_token
            });

            if (result.status === RESPONSE_STATUS.OK) {
                localStorage.setItem('token', result.data.token);
                UI.setupProfile(user.getBasicProfile().getImageUrl(), user.getBasicProfile().getName())
                UI.showAuth();
            } else {
                console.warn('error');
                UI.hideAuth();
            }
        } else {
            UI.hideAuth();
        }
    }
}