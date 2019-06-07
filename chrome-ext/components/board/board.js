import {
    extendStringProtoType
} from '/util/extended-prototype.js';
extendStringProtoType();

let template = '';
(async () => {
    const resp = await fetch('/components/board/board.html');
    const html = await resp.text();
    template = html;
})();

export function Board(data, clickHandler, removeButtonClickHandler, permissionButtonToggleHandler) {
    data.permission = data.is_public ? 'public' : 'private';

    this.data = data;
    this.element = null;

    this.element = template.bind(this.data).toDom();
    if (!this.data.is_public) {
        this.element.querySelector('.toggle-button').addClass('private');
    }

    // event listener;
    this.element.addEventListener('click', clickHandler);

    this.element.querySelector('.remove').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm('do you want to remove this data?')) {
            removeButtonClickHandler(e);
        }
    }, false);

    this.element.querySelector('.toggle-button').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        var item = e.currentTarget.parentElement;
        if (e.currentTarget.classExists('private')) {
            e.currentTarget.removeClass('private');
            item.querySelector('.permission').innerHTML = 'public';
        } else {
            e.currentTarget.addClass('private');
            item.querySelector('.permission').innerHTML = 'private';
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