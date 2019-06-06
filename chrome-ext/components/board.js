const BOARD_ITEM_TEMPLATE = '<div class="item" \
    data-id="{id}" \
    data-title="{title}" \
    data-uniquename="{uniquename}">\
        {title} \
</div>';

import {
    extendStringProtoType
} from '../util/extended-prototype.js'

extendStringProtoType();

/**
 * 
 * @param {*} data 
 */
export function Board(data, clickHandler) {
    this.element = BOARD_ITEM_TEMPLATE.bind(data).toDom();
    this.element.addEventListener('click', clickHandler);
};