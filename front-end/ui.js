import {
    extendHTMLElementProtoType
} from '/mindmap/util/extended-prototype.js';
extendHTMLElementProtoType();

export const UI = {
    Cyto: {
        tempId: 0,
        addNode: (cy, x, y, title, desc) => {
            UI.Cyto.tempId += 1;
            const style = UI.Cyto.getStyle(desc);
            const nodes = cy.add([{
                data: {
                    id: `create-${UI.Cyto.tempId}`,
                    title: title,
                    description: desc,
                    background: '#8BC34A',
                    size: style.size,
                    borderWidth: 20
                },
                position: {
                    x,
                    y
                },
                group: "nodes",
                grabbable: true
            }]);
            return nodes[0];
        },
        addEdge: (cy, source, target) => {
            UI.Cyto.tempId += 1;
            const edges = cy.add([{
                data: {
                    id: `create-${UI.Cyto.tempId}`,
                    source,
                    target
                },
                group: 'edges',
                grabbable: false,
                classes: 'saving'
            }]);
            return edges[0]
        },
        getStyle: (description) => {
            const length = description.length;
            if (length > 0 && length <= 60) {
                return {
                    background: '#3897f0',
                    size: 50
                }
            } else if (length > 60 && length <= 360) {
                return {
                    background: '#57aeff',
                    size: 70
                }
            } else if (length > 360 && length <= 1200) {
                return {
                    background: '#88c6ff',
                    size: 90
                }
            } else if (length > 1200 && length <= 4000) {
                return {
                    background: '#a8d3fb',
                    size: 110
                }
            } else if (length > 4000) {
                return {
                    background: '#d1e9ff',
                    size: 130
                }
            }
        },
        isMouseInBorder: (node, position) => {
            const distX = node._private.position.x - position.x;
            const distY = node._private.position.y - position.y;
            const radius = node._private.rstyle.nodeW / 2;
            const dist = Math.pow(distX * distX + distY * distY, 0.5);
            if (dist > radius) {
                return true;
            } else {
                return false;
            }
        },
        hidePreviewEdge: (cy) => {
            cy.$('#preview_edge').addClass('hide');
        },
        showPreviewEdge: (cy) => {
            cy.$('#preview_edge').removeClass('hide');
        },
        updatePreviewEdge: (cy, sourceNodeId, position) => {
            cy.$('#preview_edge').move({
                source: sourceNodeId
            });
            cy.$('#preview_node').position({
                x: position.x - 10,
                y: position.y - 10
            });
        },
        addPreviewEdge: (cy) => {
            cy.add([{
                data: {
                    title: '',
                    id: 'preview_node',
                    background: '#ffffff',
                    size: 1,
                    borderWidth: 0
                },
                group: 'nodes',
                classes: 'hide',
                grabbable: false,
                pannable: false
            }, {
                data: {
                    id: 'preview_edge',
                    // fix: 這裡可能會有問題如果 elements 第一個不是 node 是 edge 
                    source: cy._private.elements[0]._private.data.id,
                    target: 'preview_node'
                },
                group: 'edges',
                classes: 'hide preview',
                grabbable: false
            }]);
        },
        clearHoverNodeStyle: (cy) => {
            cy.$('.touch-border').removeClass('touch-border');
            cy.$('.touch-center').removeClass('touch-center');
        },
        mouseInBorder: (node) => {
            node.ungrabify();
            node.addClass('touch-border');
            node.removeClass('touch-center');
        },
        mouseInCenter: (node) => {
            node.grabify();
            node.removeClass('touch-border');
            node.addClass('touch-center');
        },
        mouseMoveOutNode: (cy) => {
            cy.$('.touch-border').removeClass('touch-border');
            cy.$('.touch-center').removeClass('touch-center');
        },
        reArrange: (cy) => {
            var layout = cy.layout({
                name: 'cose-bilkent',
                animate: 'end',
                animationEasing: 'ease-out',
                animationDuration: 1000,
                randomize: true
            });
            layout.run();
        }
    },
    showAuth: () => {
        document.querySelectorAll('.auth').forEach((ele) => {
            ele.removeClass('hide');
        });
        document.querySelectorAll('.unauth').forEach((ele) => {
            ele.addClass('hide');
        });
    },
    hideAuth: () => {
        document.querySelectorAll('.auth').forEach((ele) => {
            ele.addClass('hide');
        });
        document.querySelectorAll('.unauth').forEach((ele) => {
            ele.removeClass('hide');
        });
    },
    setupProfile: (profileUrl, name) => {
        document.querySelector('.profile img').setAttribute('src', profileUrl);
        document.querySelector('.profile .name').innerHTML = name;
    },
    showNodeForm: (cy, title, description, nodeId, position) => {
        document.querySelector('.node-form').removeClass('hide');
        if (nodeId.length > 0) {
            document.querySelector('.btn-update').removeClass('hide');
            document.querySelector('.btn-add').addClass('hide');
        } else {
            document.querySelector('.btn-update').addClass('hide');
            document.querySelector('.btn-add').removeClass('hide');
        }

        let estimateTop = position.y - document.querySelector('.node-form').offsetHeight - 10;;
        let estimateLeft = position.x - document.querySelector('.node-form').offsetWidth / 2;
        let targetTop, targetLeft, panX, panY;
        const currPosition = cy.pan();
        if (estimateTop < 0) {
            targetTop = 0;
            panY = currPosition.y - estimateTop;
        } else {
            targetTop = estimateTop
            panY = currPosition.y;
        }
        if (estimateLeft < 0) {
            targetLeft = 0;
            panX = currPosition.x - estimateLeft;
        } else {
            targetLeft = estimateLeft;
            panX = currPosition.x;
        }

        cy.animate({
            pan: {
                x: panX,
                y: panY
            }
        }, {
            duration: 360,
            easing: 'ease-in-out-cubic'
        });
        document.querySelector('.node-form').style.top = targetTop;
        document.querySelector('.node-form').style.left = targetLeft;

        document.querySelector('.title').value = title;
        document.querySelector('.description').value = description;
        document.querySelector('.node-id').value = nodeId
        document.querySelector('.title').focus();

        const mask = document.querySelector('.mask');
        mask.removeClass('hide');
        mask.style.opacity = 1;
    },
    hideNodeForm: () => {
        document.querySelector('.btn-add').addClass('hide');
        document.querySelector('.node-form').addClass('hide');
        document.querySelector('.btn-update').addClass('hide');
        document.querySelector('.title').value = '';
        document.querySelector('.description').value = '';
        document.querySelector('.node-id').value = ''

        const mask = document.querySelector('.mask');
        mask.style.opacity = 0;
        setTimeout(() => {
            mask.addClass('hide');
        }, 300);
    },
    openNodeWindow: (title, description) => {
        const w = 400;
        const dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
        const dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;

        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const systemZoom = width / window.screen.availWidth;
        const left = (width - w) / 2 / systemZoom + dualScreenLeft
        const top = 0
        const newWindow = window.open('', title, 'id=popup-mindmap, scrollbars=yes, width=' + w / systemZoom + ', height=' + height / systemZoom + ', top=' + top + ', left=' + left);
        const template = "<h1>{title}</h1><p>{desc}</p>"
        const result = template.replace(/{title}/gi, title)
            .replace(/{desc}/gi, description);
        newWindow.document.querySelector("body").innerHTML = result;
        newWindow.document.querySelector("head").innerHTML = "<title>" + title + "</title>"

        // Puts focus on the newWindow
        if (window.focus) newWindow.focus();
    },
    getCytoContainer: () => {
        return document.getElementById('cy');
    }
}