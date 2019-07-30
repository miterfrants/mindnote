import {
    UI
} from '/mindnote/ui.js';

import {
    GOOGLE,
    RESPONSE_STATUS
} from '/mindnote/config.js';

import {
    api
} from '/mindnote/service/api.v2.js';

import {
    Route
} from '/mindnote/route/route.js';

import {
    Toaster
} from '/mindnote/service/toaster.js';

import {
    MindnoteError,
    MINDNOTE_ERROR_TYPE
} from '/mindnote/util/mindnote-error.js';

import {
    RouterController
} from '/mindnote/route/router-controller.js';

export class Main extends RouterController {
    constructor(elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.token = args.token;
        this.context = context;
        this.me = args.me;
        this.updateSigninStatusByUserBehavior = false;
        window.gapi.load('client:auth2', async () => {
            await window.gapi.client.init({
                'apiKey': GOOGLE.AUTH.API_KEY,
                'clientId': GOOGLE.AUTH.CLIENT_ID,
                'scope': GOOGLE.AUTH.SCOPE
            });
            this.context.GoogleAuth = window.gapi.auth2.getAuthInstance();
            this.context.GoogleAuth.isSignedIn.listen(() => {
                this._updateSigninStatus();
            });
            this._updateSigninStatus();
        });
        this._bindEvent();
    }

    async enter(args) {
        super.enter(args);
        UI.header.generateNavigation([]);
        this.me = args.me;
        if (args.me) {
            if (args.me.is_subscribed && args.me.is_next_subscribe) {
                UI.subscribed();
            } else if (args.me.is_subscribed && !args.me.is_next_subscribe) {
                UI.unsubscribing();
            } else {
                UI.unsubscribed();
            }
        }

    }

    _bindEvent() {
        document.querySelector('.btn-logout').addEventListener('click', () => {
            this.updateSigninStatusByUserBehavior = true;
            this.context.GoogleAuth.signOut();
            localStorage.setItem('token', '');
            localStorage.setItem('username', '');
            localStorage.setItem('profile_url', '');
            UI.hideAuth();
            UI.header.hideAuth();
            UI.header.generateNavigation([]);
        });

        document.querySelector('.header .btn-unsubscribe').addEventListener('click', async () => {
            this.elHTML.querySelector('.menu').addClass('hide');
            if (prompt('你真的要退訂閱嗎？ 如果這是真的，請輸入 \'UNSUBSCRIBE\'') !== 'UNSUBSCRIBE') {
                return;
            }

            const resp = await api.authApiService.transaction.delete({
                token: this.token
            });

            if (resp.status === RESPONSE_STATUS.OK) {
                Toaster.popup(MINDNOTE_ERROR_TYPE.INFO, '已完成退訂閱，下一期我們會停止扣款', 5000);
                UI.unsubscribing();
                return;
            } else {
                if (resp.httpStatus === 417) {
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
                } else {
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
                }
            }
        });

        document.querySelectorAll('.auth-google').forEach((el) => {
            el.addEventListener('click', () => {
                this.updateSigninStatusByUserBehavior = true;
                this.context.GoogleAuth.signIn();
            });
        });

        document.querySelector('.profile').addEventListener('click', () => {
            const menu = document.querySelector('.menu');
            if (menu.classExists('hide')) {
                menu.removeClass('hide');
            } else {
                menu.addClass('hide');
            }
        });

        this.elHTML.querySelector('.menu-item-my-boards').addEventListener('click', () => {
            this.elHTML.querySelector('.menu').addClass('hide');
        });
    }

    async _updateSigninStatus() {
        const user = this.context.GoogleAuth.currentUser.get();
        const isGoogleAuthorized = user.hasGrantedScopes(GOOGLE.AUTH.SCOPE);
        let token = localStorage.getItem('token');
        let username = localStorage.getItem('username');
        let profile = localStorage.getItem('profile_url');

        if (isGoogleAuthorized) {
            if (!token || !username) {
                const result = await api.apiService.auth.post({
                    code: user.getAuthResponse().access_token
                });
                if (result.status === RESPONSE_STATUS.OK) {
                    localStorage.setItem('token', result.data.token);
                    localStorage.setItem('username', result.data.username);
                    token = result.data.token;
                    username = result.data.username;
                } else {
                    UI.header.generateNavigation([]);
                    UI.header.hideAuth();
                    return;
                }
            }

            UI.setupProfile(user.getBasicProfile().getImageUrl(), user.getBasicProfile().getName());
            UI.header.showAuth();
            UI.showAuth();
        } else if (token) {
            UI.setupProfile(profile, this.me.fullname);
            UI.header.showAuth();
            UI.showAuth();
        } else {
            UI.header.hideAuth();
            UI.hideAuth();
        }
        if (this.updateSigninStatusByUserBehavior) {
            Route.runFromController(this.context, location.pathname, Main);
        }
        this.updateSigninStatusByUserBehavior = false;
    }
}