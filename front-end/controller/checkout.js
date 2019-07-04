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
                // Style all elements
                'input': {
                    'color': 'gray'
                },
                // Styling ccv field
                'input.cvc': {
                    // 'font-size': '16px'
                },
                // Styling expiration-date field
                'input.expiration-date': {
                    // 'font-size': '16px'
                },
                // Styling card-number field
                'input.card-number': {
                    // 'font-size': '16px'
                },
                // style focus state
                ':focus': {
                    // 'color': 'black'
                },
                // style valid state
                '.valid': {
                    'color': 'green'
                },
                // style invalid state
                '.invalid': {
                    'color': 'red'
                },
                // Media queries
                // Note that these apply to the iframe, not the root window.
                '@media screen and (max-width: 400px)': {
                    'input': {
                        'color': 'orange'
                    }
                }
            }
        });
        this._bindEvent();
        this.token = args.token;
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
            if (e.currentTarget.classExists('disabled')) {
                return;
            }
            e.currentTarget.addClass('disabled');

            // 取得 TapPay Fields 的 status
            const tappayStatus = TPDirect.card.getTappayFieldsStatus()

            // 確認是否可以 getPrime
            if (tappayStatus.canGetPrime === false) {
                alert('can not get prime')
                return
            }

            // Get prime
            try {
                TPDirect.card.getPrime(async (result) => {
                    if (result.status !== 0) {
                        alert('get prime error ' + result.msg)
                        return
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
                })
            } catch (error) {
                if (error instanceof MindmapError) {
                    throw error;
                }
                throw new MindmapError(MINDMAP_ERROR_TYPE.ERROR, error.message);
            }

        });
    }
}