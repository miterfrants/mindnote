import {
    extendStringProtoType
} from '/util/extended-prototype.js';
extendStringProtoType();

import {
    remoteEndpoint
} from '/config.js';

let template = '';
(async () => {
    const resp = await fetch('/components/board/board.html');
    const html = await resp.text();
    template = html;
})();
let continueDeleteCount = 0;

export function Board(data, clickHandler, removeButtonClickHandler, permissionButtonToggleHandler) {
    data.permission = data.is_public ? '公開' : '隱藏';
    this.data = data;
    this.element = null;
    let self = this;
    this.element = template.bind(this.data).toDom();
    if (!this.data.is_public) {
        this.element.querySelector('.toggle-button').addClass('private');
    }

    // event listener;
    this.element.addEventListener('click', clickHandler);

    this.element.querySelector('.remove').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        let result = 'DELETE';
        if (continueDeleteCount < 2) {
            result = prompt('如果需要刪除，請輸入 "DELETE"');
        }
        continueDeleteCount += 1;
        setTimeout(() => {
            continueDeleteCount = 0;
        }, 120 * 1000);

        if (result === 'DELETE') {
            removeButtonClickHandler(e);
        }
    }, false);

    this.element.querySelector('.btn-link').addEventListener('click', (e) => {
        window.open([remoteEndpoint + '/mindmap/users/me/boards/', self.data.id, '/'].join(''));
    });

    this.element.querySelector('.toggle-button').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        var item = e.currentTarget.parentElement;
        if (e.currentTarget.classExists('private')) {
            e.currentTarget.removeClass('private');
            item.querySelector('.permission').innerHTML = '公開';
        } else {
            e.currentTarget.addClass('private');
            item.querySelector('.permission').innerHTML = '隱藏';
        }
        permissionButtonToggleHandler(e);
        return;
    }, false);

    this.update = (data) => {
        for (var key in this.element.dataset) {
            if (data[key] !== undefined) {
                this.element.dataset[key] = data[key];
            }
        }
    }
};