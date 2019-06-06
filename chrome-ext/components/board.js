const BOARD_ITEM_TEMPLATE = '<div class="item" \
    data-id="{id}" \
    data-title="{title}" \
    data-uniquename="{uniquename}">\
        {title} \
    <button class="fa fa-icon fa-times-circle remove"></button>\
</div>';

import {
    extendStringProtoType
} from '../util/extended-prototype.js'

extendStringProtoType();

/**
 * 
 * @param {*} data 
 */
export function Board(data, clickHandler, removeButtonClickHandler) {
    this.element = BOARD_ITEM_TEMPLATE.bind(data).toDom();
    this.element.addEventListener('click', clickHandler);
    this.element.querySelector('.remove').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm('do you want to remove this data?')) {
            removeButtonClickHandler(e);
        }
    });
};