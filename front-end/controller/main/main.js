import {
    UI
} from '/mindnote/ui.js';

import {
    RESPONSE_STATUS
} from '/mindnote/constants.js';

import {
    GOOGLE
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
    CookieUtil
} from '/mindnote/service/cookie.js';

import {
    MindnoteError,
    MINDNOTE_ERROR_TYPE
} from '/mindnote/util/mindnote-error.js';

import {
    RouterController
} from '/mindnote/route/router-controller.js';
import {
    Swissknife
} from '/mindnote/service/swissknife.js';

export class Main extends RouterController {
    async init(args, context) {
        this.updateSigninStatusByUserBehavior = false;
        this.context = context;

        window.gapi.load('client:auth2', async () => {
            await window.gapi.client.init({
                'apiKey': GOOGLE.AUTH.API_KEY,
                'clientId': GOOGLE.AUTH.CLIENT_ID,
                'scope': GOOGLE.AUTH.SCOPE
            });
            this.context.GoogleAuth = window.gapi.auth2.getAuthInstance();
            this.context.GoogleAuth.isSignedIn.listen(() => {
                this.updateSigninStatus();
            });
            this.updateSigninStatus();
        });

        this.bindEvent();
    }

    async enter(args) {
        super.enter(args);
        if (Swissknife.getQueryString('hide-header') === 'true') {
            this.elHTML.querySelector('.header').addClass('hide');
        } else {
            this.elHTML.querySelector('.header').removeClass('hide');
        }
    }

    async render() {
        super.render();
        UI.header.generateNavigation([]);
        if (this.args.me) {
            if (this.args.me.is_subscribed && this.args.me.is_next_subscribe) {
                UI.subscribed();
            } else if (this.args.me.is_subscribed && !this.args.me.is_next_subscribe) {
                UI.unsubscribing();
            } else {
                UI.unsubscribed();
            }
        }

        // set metadata
        UI.header.setMetaData({
            title: 'Mindnote 心智筆記',
            image: location.origin + '/mindnote/imgs/apple-icon-180x180.png'
        });
    }

    bindEvent() {
        this.elHTML.querySelector('.btn-logout').addEventListener('click', () => {
            this.updateSigninStatusByUserBehavior = true;
            this.context.GoogleAuth.signOut();
            localStorage.setItem('token', '');
            CookieUtil.eraseCookie('token');
            localStorage.setItem('username', '');
            localStorage.setItem('profile_url', '');
            UI.hideAuth();
            UI.header.hideAuth();
            UI.header.generateNavigation([]);
            if (location.pathname !== '/mindnote/') {
                history.pushState({}, '', '/mindnote/');
            }
        });

        this.elHTML.querySelector('.header .btn-unsubscribe').addEventListener('click', async () => {
            this.elHTML.querySelector('.menu').addClass('hide');
            if (prompt('你真的要退訂閱嗎？ 如果這是真的，請輸入 \'UNSUBSCRIBE\'') !== 'UNSUBSCRIBE') {
                return;
            }

            const resp = await api.authApiService.transaction.delete({
                token: this.args.token
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

        this.elHTML.querySelectorAll('.auth-google').forEach((el) => {
            el.addEventListener('click', () => {
                this.updateSigninStatusByUserBehavior = true;
                this.context.GoogleAuth.signIn();
            });
        });

        this.elHTML.querySelector('.profile').addEventListener('click', () => {
            const menu = this.elHTML.querySelector('.menu');
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

    async updateSigninStatus() {
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
                    CookieUtil.setCookie('token', result.data.token);
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
            UI.setupProfile(profile, this.args.me.fullname);
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