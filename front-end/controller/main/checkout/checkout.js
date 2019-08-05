import {
    api
} from '/mindnote/service/api.v2.js';
import {
    RESPONSE_STATUS
} from '/mindnote/constants.js';
import {
    MindnoteError,
    MINDNOTE_ERROR_TYPE
} from '/mindnote/util/mindnote-error.js';

import {
    UI
} from '/mindnote/ui.js';

import {
    Toaster
} from '/mindnote/service/toaster.js';

import {
    RouterController
} from '/mindnote/route/router-controller.js';

export class Checkout extends RouterController {
    async init(args, context) {
        this.appendDotCycleTimer;
        window.TPDirect.setupSDK(13848, 'app_N9VZ8fjo8HLgqx882iYUeaH7BgXlIW8TeZ8CF4wlvKo0mP82CKxAKLT50rRq', 'sandbox');
        this.bindEvent();
    }
    async enter(args) {
        super.enter(args);
        if (this.args.me.is_subscribed) {
            history.pushState({}, '', '/mindnote/users/me/boards/');
            if (this.args.me.is_next_subscribe) {
                Toaster.popup(MINDNOTE_ERROR_TYPE.INFO, '你已經是訂閱用戶');
            } else {
                Toaster.popup(MINDNOTE_ERROR_TYPE.INFO, '目前你還是訂閱用戶，將在下一期取消訂閱');
            }
        }
    }

    async render() {
        super.render();
        UI.header.generateNavigation([{
            title: '我的分類',
            link: '/mindnote/users/me/boards/'
        }]);
        const container = this.elHTML;
        container.querySelector('#card_holder').value = this.args.me.fullname;
        container.querySelector('#email').value = this.args.me.email;
        container.querySelector('#phone').value = this.args.me.phone;
        container.querySelector('.btn-subscribe').removeClass('disabled');
    }

    async postRender() {
        var fields = {
            number: {
                // css selector
                element: '#card-number',
                placeholder: '**** **** **** ****'
            },
            expirationDate: {
                // DOM object
                element: this.elHTML.querySelector('#card-expiration-date'),
                placeholder: 'MM / YY'
            },
            ccv: {
                element: '#card-ccv',
                placeholder: '後三碼'
            }
        };
        window.TPDirect.card.setup({
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
    }

    bindEvent() {
        const container = this.elHTML;
        container.querySelector('.btn-subscribe').addEventListener('click', (e) => {
            const elBtnSubscribe = e.currentTarget;
            elBtnSubscribe.innerHTML = '訂閱中...';
            this.appendDotCycle(elBtnSubscribe);

            if (elBtnSubscribe.classExists('disabled')) {
                return;
            }
            elBtnSubscribe.addClass('disabled');

            // 取得 TapPay Fields 的 status
            const tappayStatus = window.TPDirect.card.getTappayFieldsStatus();

            // 確認是否可以 getPrime
            if (tappayStatus.canGetPrime === false) {
                if (tappayStatus.status.number !== 0) {
                    Toaster.popup(MINDNOTE_ERROR_TYPE.WARN, '信用卡卡號錯誤');
                } else if (tappayStatus.status.expiry !== 0) {
                    Toaster.popup(MINDNOTE_ERROR_TYPE.WARN, '不正確的過期時間');
                } else if (tappayStatus.status.ccv !== 0) {
                    Toaster.popup(MINDNOTE_ERROR_TYPE.WARN, '卡片背面三碼錯誤');
                }
                elBtnSubscribe.removeClass('disabled');
                elBtnSubscribe.innerHTML = '訂閱 &nbsp;&nbsp;&nbsp;&nbsp; $ 99 / 月';
                clearTimeout(this.appendDotCycleTimer);
                return;
            }
            // Get prime
            window.TPDirect.card.getPrime(async (result) => {
                if (result.status !== 0) {
                    elBtnSubscribe.removeClass('disabled');
                    elBtnSubscribe.innerHTML = '訂閱 &nbsp;&nbsp;&nbsp;&nbsp; $ 99 / 月';
                    clearTimeout(this.appendDotCycleTimer);
                    throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, result.msg);
                }

                const card_holder = this.elHTML.querySelector('#card_holder').value;
                const phone = this.elHTML.querySelector('#phone').value;
                const email = this.elHTML.querySelector('#email').value;

                const resp = await api.authApiService.transaction.post({
                    token: this.args.token,
                    prime: result.card.prime,
                    card_holder,
                    phone,
                    email
                });

                elBtnSubscribe.removeClass('disabled');
                elBtnSubscribe.innerHTML = '訂閱 &nbsp;&nbsp;&nbsp;&nbsp; $ 99 / 月';
                clearTimeout(this.appendDotCycleTimer);
                if (resp.status === RESPONSE_STATUS.OK) {
                    history.pushState({}, '', '/mindnote/users/me/boards/');
                    Toaster.popup(MINDNOTE_ERROR_TYPE.INFO, '感謝你的訂閱');
                } else {
                    if (resp.httpStatus === 417) {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.WARN, resp.data.errorMsg);
                    } else {
                        throw new MindnoteError(MINDNOTE_ERROR_TYPE.ERROR, resp.data.errorMsg);
                    }
                }
            });

        });
    }
    appendDotCycle(element) {
        element.innerHTML = element.innerHTML + '.';
        this.appendDotCycleTimer = setTimeout(() => {
            this.appendDotCycle(element);
        }, 500);
    }
}