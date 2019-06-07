import {
    extendStringProtoType,
    extendHTMLElementProtoType
} from '../../util/extended-prototype.js'

extendStringProtoType();
extendHTMLElementProtoType();

let template = '';
(async () => {
    const resp = await fetch('/components/node/node.html');
    const html = await resp.text();
    template = html;
})();

export function Node(data, clickButtonHandler) {
    this.element = template.bind(data).toDom();
    this.data = data;
    this.element.addEventListener('click', clickButtonHandler);
};