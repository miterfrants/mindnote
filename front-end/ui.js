export const UI = {
    tempId: 0,
    addNode: (cy, x, y, title, desc) => {
        UI.tempId += 1;
        const style = UI.getStyle(desc);
        const nodes = cy.add([{
            data: {
                id: `create-${UI.tempId}`,
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
        UI.tempId += 1;
        const edges = cy.add([{
            data: {
                id: `create-${UI.tempId}`,
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
    hidePreviewEdge: (cy)=>{
        cy.$('#preview_edge').addClass('hide');
    },
    showPreviewEdge: (cy)=>{
        cy.$('#preview_edge').removeClass('hide');
    },
    updatePreviewEdge: (cy, sourceNodeId, position)=>{
        cy.$('#preview_edge').move({ source: sourceNodeId });
        cy.$('#preview_node').position({ x: position.x - 10, y: position.y - 10 });
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
        },{
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
    clearHoverNodeStyle: (cy)=>{
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
    }
}