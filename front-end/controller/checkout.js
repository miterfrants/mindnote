import {
    api
} from '/mindmap/service/api.v2.js';
import {
    RESPONSE_STATUS
} from '/mindmap/config.js';
import {
    MindmapError,
    MINDMAP_ERROR_TYPE
} from '/mindmap/util/mindmap-error.js';

import {
    UI
} from '/mindmap/ui.js';

import {
    Toaster
} from '/mindmap/service/toaster.js';

export class Checkout {
    constructor(args, context) {
        this.init(args, context);
        this.run(args, context);
    }
    async init(args, context) {
        var fields = {
            number: {
                // css selector
                element: '#card-number',
                placeholder: '**** **** **** ****'
            },
            expirationDate: {
                // DOM object
                element: document.getElementById('card-expiration-date'),
                placeholder: 'MM / YY'
            },
            ccv: {
                element: '#card-ccv',
                placeholder: '後三碼'
            }
        }
        TPDirect.card.setup({
            fields: fields,
            styles: {
                'input': {
                    'font-size': '14px',
                    'color': '#2a2a2a'
                },
                '.valid': {
                    'color': '#2a2a2a'
                },
                '.invalid': {
                    'color': '#fa5c2d'
                },
                '@media screen and (max-width: 400px)': {
                    'input': {
                        'color': '#2a2a2a'
                    }
                }
            }
        });
        this._bindEvent();
        this.token = args.token;
        this.appendDOtCycleTimer;
    }
    async run(args, context) {
        const me = args.me;
        if (me.is_subscribed) {
            history.pushState({}, '', '/mindmap/users/me/boards/');
            Toaster.popup(MINDMAP_ERROR_TYPE.INFO, 'Thank you for subcribing')
        }
        UI.header.generateNavigation([{
            title: 'Boards',
            link: '/mindmap/users/me/boards/'
        }]);
        const container = document.querySelector('.router-checkout');
        container.querySelector('#card_holder').value = me.fullname;
        container.querySelector('#email').value = me.email;
        container.querySelector('#phone').value = me.phone;
        container.querySelector('.btn-subscribe').removeClass('disabled');

    }

    _bindEvent() {
        const container = document.querySelector('.router-checkout');
        container.querySelector('.btn-subscribe').addEventListener('click', (e) => {
            const elBtnSubscribe = e.currentTarget;
            elBtnSubscribe.innerHTML = 'Subscribing';
            this.appendDotCycle(elBtnSubscribe);

            if (elBtnSubscribe.classExists('disabled')) {
                return;
            }
            elBtnSubscribe.addClass('disabled');

            // 取得 TapPay Fields 的 status
            const tappayStatus = TPDirect.card.getTappayFieldsStatus()

            // 確認是否可以 getPrime
            if (tappayStatus.canGetPrime === false) {
                if (tappayStatus.status.number !== 0) {
                    Toaster.popup(MINDMAP_ERROR_TYPE.WARN, 'The card number is wrong')
                } else if (tappayStatus.status.expiry !== 0) {
                    Toaster.popup(MINDMAP_ERROR_TYPE.WARN, 'Invalid expiration date')
                } else if (tappayStatus.status.ccv !== 0) {
                    Toaster.popup(MINDMAP_ERROR_TYPE.WARN, 'CCV is wrong')
                }
                elBtnSubscribe.removeClass('disabled');
                elBtnSubscribe.innerHTML = 'Subscribe';
                clearTimeout(this.appendDOtCycleTimer);
                return
            }
            // Get prime
            TPDirect.card.getPrime(async (result) => {
                if (result.status !== 0) {
                    elBtnSubscribe.removeClass('disabled');
                    elBtnSubscribe.innerHTML = 'Subscribe';
                    clearTimeout(this.appendDOtCycleTimer);
                    throw new MindmapError(MINDMAP_ERROR_TYPE.ERROR, result.msg);
                }

                const card_holder = document.querySelector('#card_holder').value;
                const phone = document.querySelector('#phone').value;
                const email = document.querySelector('#email').value;

                const resp = await api.authApiService.transaction.post({
                    token: this.token,
                    prime: result.card.prime,
                    card_holder,
                    phone,
                    email
                });

                elBtnSubscribe.removeClass('disabled');
                elBtnSubscribe.innerHTML = 'Subscribe';
                clearTimeout(this.appendDOtCycleTimer);
                if (resp.status === RESPONSE_STATUS.OK) {
                    history.pushState({}, '', '/mindmap/users/me/boards/');
                    Toaster.popup(MINDMAP_ERROR_TYPE.INFO, 'Thank you for subscribing');
                } else {
                    if (resp.httpStatus === 417) {
                        throw new MindmapError(MINDMAP_ERROR_TYPE.WARN, resp.data.errorMsg);
                    } else {
                        throw new MindmapError(MINDMAP_ERROR_TYPE.ERROR, resp.data.errorMsg);
                    }
                }
            });

        });
    }
    appendDotCycle(element) {
        element.innerHTML = element.innerHTML + '.';
        this.appendDOtCycleTimer = setTimeout(() => {
            this.appendDotCycle(element);
        }, 500);
    }
}