import {
    RouterController
} from '/mindnote/route/router-controller.js';

import {
    UI
} from '/mindnote/ui.js';

import {
    Swissknife
} from '/mindnote/service/swissknife.js';

export class RequireLogin extends RouterController {
    async init() {
        this.bindingEvent();
    }

    async enter(args) {
        super.enter(args);
        if (this.args.token !== null && this.args.token !== undefined && this.args.token.length > 0) {
            const redirect = Swissknife.getQueryString('redirect');
            history.replaceState({}, '', redirect);
        } else {
            UI.requireLogin.showLoginButton(this.elHTML);
        }
    }

    bindingEvent() {
        this.elHTML.querySelector('.auth-google').addEventListener('click', () => {
            document.querySelector('.header .auth-google').click();
        });
    }
}