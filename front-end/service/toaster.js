import {
    extendStringProtoType,
    extendHTMLElementProtoType
} from '/mindmap/util/extended-prototype.js';

extendStringProtoType();
extendHTMLElementProtoType();

export const Toaster = {
    TEMPLATE: '<div class="toaster"></div>',
    TEMPLATE_ITEM: '<div class="toaseter-item"></div>',
    popup: (className, message) => {
        let elToaster = document.querySelector('.toaster');
        if (!elToaster) {
            elToaster = Toaster.TEMPLATE.toDom();
            document.body.appendChild(elToaster);
        }

        const toasterItem = new ToasterMessage(elToaster, className, message, 5000);
        toasterItem.show();
    }
}

class ToasterMessage {
    constructor(container, className, message, duration) {
        this.timer;
        this.el = Toaster.TEMPLATE_ITEM.toDom();
        this.el.innerHTML = message;
        this.el.addClass(className);
        this.duration = duration;
        this.container = container;
        container.prepend(this.el);
    }
    show() {
        this.el.addClass('show');
        setTimeout(() => {
            this.el.removeClass('show');
            setTimeout(() => {
                this.container.removeChild(this.el);
            }, 300)
        }, this.duration)
    }
}