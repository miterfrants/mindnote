const BOARD_ITEM_TEMPLATE = '<div class="item" \
    data-id="{id}" \
    data-title="{title}" \
    data-uniquename="{uniquename}"\
    data-is_public="{is_public}"\
    >\
    <div class="content-section">{title}</div>\
    <div class="function-section">\
        <div class="toggle-section">\
            <button class="toggle-button">\
            </button>\
            <span class="permission">{permission}</span>\
        </div>\
        <button class="fa fa-icon fa-times-circle remove"></button>\
    </div>\
</div>';

import {
    extendStringProtoType
} from '../util/extended-prototype.js'

extendStringProtoType();

/**
 * 
 * @param {*} data 
 */
export function Board(data, clickHandler, removeButtonClickHandler, permissionButtonToggleHandler) {
    data.permission = data.is_public ? 'public' : 'private';
    this.element = BOARD_ITEM_TEMPLATE.bind(data).toDom();

    if(!data.is_public) {
        this.element.querySelector('.toggle-button').addClass('private');
    }
    this.update = (data) => {
        for (var key in this.element.dataset) {
            if (data[key] !== undefined) {
                this.element.dataset[key] = data[key];
            }
        }
    }
    this.element.addEventListener('click', (e) => {
        clickHandler(e);
    });
    this.element.querySelector('.remove').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm('do you want to remove this data?')) {
            removeButtonClickHandler(e);
        }
    }, false);
    this.element.querySelector('.toggle-button').addEventListener('click', (e) => {
        var item = e.currentTarget.parentElement;
        if (e.currentTarget.classExists('private')) {
            e.currentTarget.removeClass('private');
            item.querySelector('.permission').innerHTML = 'public';
        } else {
            e.currentTarget.addClass('private');
            item.querySelector('.permission').innerHTML = 'private';
        }
        permissionButtonToggleHandler(e);
        e.stopPropagation();
        e.preventDefault();
        return;
    }, false);
};