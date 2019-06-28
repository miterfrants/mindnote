import {
    UI
} from '/mindmap/ui.js';
export const Cyto = {
    _isEditMode: false,
    _mousedown: false,
    _edgeSourceNode: null,
    _isConnecting: undefined,
    cy: null,

    _tappedBefore: null,
    _tappedTimeout: null, // for manual implement double tap
    _editNode: null,

    _createNode: null,
    _createNodePositionX: null,
    _createNodePositionY: null,
    init: (container, nodes, relationship, isEditMode) => {
        Cyto._isEditMode = isEditMode;

        // prepare data
        nodes = nodes.map((node) => {
            const style = UI.Cyto.getStyle(node.description)
            return {
                ...node,
                style
            }
        });
        const elements = Cyto.prepareData(nodes, relationship, isEditMode ? 20 : 0);

        Cyto.cy = cytoscape({
            container: container,
            layout: {
                name: 'cose-bilkent',
                animate: false,
                randomize: true
            },

            style: [{
                selector: 'node',
                style: {
                    'background-color': 'data(background)',
                    'label': 'data(title)',
                    'font-size': '10px',
                    'height': 'data(size)',
                    'width': 'data(size)',
                    'border-width': 'data(borderWidth)',
                    'border-alignment': 'outside',
                    'border-color': 'data(background)',
                    'border-opacity': 0.25,
                    'overlay-opacity': 0
                }
            }, {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#4ba6d8'
                }
            }, {
                selector: '.touch-border',
                style: {
                    'border-color': '#ffbc00',
                    'border-opacity': 0.25
                }
            }, {
                selector: '.touch-center',
                style: {
                    'border-color': '#ffbc00',
                    'border-opacity': 0.25,
                    'background-color': '#ffbc00',
                }
            }, {
                selector: '.hide',
                style: {
                    'opacity': 0
                }
            }, {
                selector: '.preview',
                style: {
                    'line-color': '#eeb349',
                    'background-color': '#eeb349'
                }
            }, {
                selector: '.saving',
                style: {
                    'line-color': '#8BC34A',
                    'background-color': '#8BC34A'
                }
            }],
            elements
        })

        if (Cyto.cy.nodes().length > 0) {
            UI.Cyto.addPreviewEdge(Cyto.cy);
        }

        Cyto.cy.on('tap', (e) => {
            Cyto.tapHandler(e, Cyto._isEditMode);
        });
        if (Cyto._isEditMode) {
            Cyto.cy.on('mousedown', Cyto.mousedownInEditModeHandler);
            Cyto.cy.on('mouseup', Cyto.mouseupInEditModeHandler);
            Cyto.cy.on('mousemove', Cyto.mousemoveInEditModeHandler);
        }
        Cyto.cy.on('doubleTap', Cyto.doubleTapHandler)

        // from index.html
        Cyto.cy.on('createNode', (e, title, description) => {
            e.position = {
                x: Cyto._createNodePositionX,
                y: Cyto._createNodePositionY
            };
            Cyto.createNodeHandler(e, title, description);
        });
        Cyto.cy.on('createNodeDone', Cyto.createNodeDoneHandler);
        Cyto.cy.on('saveEdgeDone', Cyto.saveEdgeDoneHandler)
        Cyto.cy.on('updateNodeDone', Cyto.updateNodeDoneHandler);
        Cyto.cy.on('deleteNodeDone', Cyto.deleteNodeDoneHandler)
        return Cyto.cy;
    },
    deleteNodeDoneHandler: (e, data) => {
        const node = Cyto.cy.$('#node-' + data.id);
        Cyto.cy.remove(node);
    },
    prepareData: (nodes, relationship, borderWidth) => {
        const elements = [];
        for (let i = 0; i < nodes.length; i++) {
            elements.push({
                data: {
                    id: 'node-' + nodes[i].id,
                    title: nodes[i].title,
                    description: nodes[i].description,
                    background: nodes[i].style.background,
                    size: nodes[i].style.size,
                    borderWidth: borderWidth
                },
                group: "nodes",
                grabbable: true,
            });
        }

        for (let i = 0; i < relationship.length; i++) {
            elements.push({
                data: {
                    id: 'edge-' + relationship[i].id,
                    source: 'node-' + relationship[i].parent_node_id,
                    target: 'node-' + relationship[i].child_node_id,
                },
                group: "edges",
                grabbable: true
            })
        }

        return elements;
    },
    saveEdgeDoneHandler: (e, data) => {
        data.edgeInstance.removeClass('saving');
        data.edgeInstance.data('id', data.id);
    },
    createNodeHandler: (e, title, description) => {
        // fix: 這個會有問題，當create node 很快或是網路很慢，就會造成後面動作產生的 node 取代掉現有的 _createNode 
        Cyto._createNode = UI.Cyto.addNode(Cyto.cy, e.position.x, e.position.y, title, description);
    },
    createNodeDoneHandler: (e, data) => {
        const node = Cyto._createNode;
        const style = UI.Cyto.getStyle(node.data().description);
        for (let key in style) {
            node.data(key, style[key]);
        }

        // 複製一份新的 node 把綠色換成藍色
        const nodeConstructData = node.json();
        nodeConstructData.data.id = data.id;
        Cyto.cy.add([
            nodeConstructData
        ]);
        Cyto.cy.remove(node);

        // 如果是第一個 node 加上 preview edge
        if (Cyto.cy.nodes().length === 1) {
            UI.Cyto.addPreviewEdge(Cyto.cy);
        }
        Cyto._isCreating = false;
        Cyto._createNode = null;

        var event = new CustomEvent('create-node-done', {
            bubbles: true,
            cancelable: true
        });
        Cyto.cy.container().dispatchEvent(event);
    },
    updateNodeDoneHandler: (e, data) => {
        const node = Cyto.cy.$('#node-' + data.id);
        const style = UI.Cyto.getStyle(data.description);
        for (let key in style) {
            node.data(key, style[key]);
        }
        node.data('title', data.title);
        node.data('description', data.description);

        var event = new CustomEvent('update-node-done', {
            bubbles: true,
            cancelable: true
        });
        Cyto.cy.container().dispatchEvent(event);
    },
    doubleTapHandler: (e) => {
        if (Cyto.isNode(e)) {
            const data = e.target.data();
            var event = new CustomEvent('double-tap-node', {
                bubbles: true,
                cancelable: true,
                detail: {
                    title: data.title,
                    description: data.description
                }
            });
            Cyto.cy.container().dispatchEvent(event);
        }
    },
    tapHandler: (e, isEditMode) => {
        let tappedNow = event.target;
        let originalTapEvent;
        if (Cyto._tappedTimeout && Cyto._tappedBefore) {
            clearTimeout(Cyto._tappedTimeout);
        }
        if (Cyto._tappedBefore === tappedNow) {
            e.target.trigger('doubleTap', e);
            Cyto._tappedBefore = null;
        } else {
            Cyto._tappedTimeout = setTimeout(function () {
                Cyto._tappedBefore = null;
                if (isEditMode) {
                    Cyto.tapInEditModeHandler(e);
                }
            }, 200);
            Cyto._tappedBefore = tappedNow;
        }
    },
    tapInEditModeHandler: (e) => {
        if (e.target === Cyto.cy) {
            if (!Cyto._isCreating) {
                Cyto._createNode = null;
                Cyto._createNodePositionX = e.position.x;
                Cyto._createNodePositionY = e.position.y;
                var event = new CustomEvent('tap-canvas', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        position: {
                            x: e.originalEvent.clientX,
                            y: e.originalEvent.clientY
                        }
                    }
                });
                Cyto.cy.container().dispatchEvent(event);
            }
        } else if (Cyto.isNode(e)) {
            const data = e.target.data();
            var event = new CustomEvent('tap-node', {
                bubbles: true,
                cancelable: true,
                // refactor: 修改為 node 位置
                detail: {
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    position: {
                        x: e.originalEvent.clientX,
                        y: e.originalEvent.clientY
                    }
                }
            });
            Cyto.cy.container().dispatchEvent(event);
        }
    },
    mousedownInEditModeHandler: (e) => {
        Cyto._mousedown = true;
        if (Cyto.isNode(e)) {
            Cyto._edgeSourceNode = e.target;
            if (Cyto._isConnecting !== undefined) {
                return;
            }
            if (UI.Cyto.isMouseInBorder(e.target, {
                    x: e.position.x,
                    y: e.position.y
                })) {
                Cyto._isConnecting = true;
            } else {
                Cyto._isConnecting = false;
            }
        }
    },
    mouseupInEditModeHandler: (e) => {
        if (
            Cyto._isConnecting &&
            Cyto.isNode(e)
        ) {
            const sourceId = Cyto._edgeSourceNode._private.data.id;
            const targetId = e.target._private.data.id;
            // prevent self link
            if (sourceId === targetId) {
                return;
            }
            const edgeInstance = UI.Cyto.addEdge(Cyto.cy, sourceId, targetId);

            // bubble event to html
            var event = new CustomEvent('save-edge', {
                bubbles: true,
                cancelable: true,
                detail: {
                    parent_node_id: sourceId,
                    child_node_id: targetId,
                    edgeInstance // for after http request done and change edge status
                }
            });
            Cyto.cy.container().dispatchEvent(event);
        }
        Cyto._mousedown = false;
        Cyto._edgeSourceNode = null;
        Cyto._isConnecting = undefined;
        UI.Cyto.hidePreviewEdge(Cyto.cy);
    },
    mousemoveInEditModeHandler: (e) => {
        if (Cyto._isConnecting) {
            const sourceId = Cyto._edgeSourceNode._private.data.id;
            UI.Cyto.updatePreviewEdge(Cyto.cy, sourceId, e.position);
            UI.Cyto.showPreviewEdge(Cyto.cy);
            return;
        }
        if (Cyto.isNode(e)) {
            UI.Cyto.clearHoverNodeStyle(Cyto.cy);
            const node = e.target;
            const isMouseInBorder = UI.Cyto.isMouseInBorder(node, {
                x: e.position.x,
                y: e.position.y
            });
            if (isMouseInBorder) {
                UI.Cyto.mouseInBorder(e.target);
            } else {
                UI.Cyto.mouseInCenter(e.target);
            }
        } else {
            UI.Cyto.mouseMoveOutNode(Cyto.cy);
        }
    },
    isNode: (e) => {
        return (e.target &&
            e.target.isNode &&
            e.target.isNode());
    }
};