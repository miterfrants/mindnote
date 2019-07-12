import {
    UI
} from '/mindmap/ui.js';
import {
    Image
} from '/mindmap/service/image.js';
export const Cyto = {
    _isEditMode: false,
    _mousedown: false,
    _edgeSourceNode: null,
    _isConnecting: undefined,
    isDisableConnecting: false,
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
        // const elements = Cyto.prepareData(nodes, relationship, isEditMode ? 20 : 0);
        const elements = Cyto.prepareData(nodes, relationship, 20);
        Cyto.cy = cytoscape({
            container: container,
            layout: {
                name: 'cose-bilkent',
                animate: false,
                randomize: true
            },
            wheelSensitivity: 0.1,
            style: [{
                selector: 'node',
                style: {
                    'background-color': 'data(background)',
                    'background-image': 'data(backgroundImage)',
                    'background-fit': 'cover cover',
                    'background-image-opacity': 1,
                    'label': 'data(title)',
                    'font-size': '10px',
                    'height': 'data(size)',
                    'width': 'data(size)',
                    'border-width': 'data(borderWidth)',
                    'border-alignment': 'outside',
                    'border-color': 'data(background)',
                    'border-opacity': 0.25,
                    'overlay-opacity': 0,
                    'color': '#333'
                }
            }, {
                selector: 'node.delete-mode',
                style: {
                    'border-width': 0
                }
            }, {
                selector: 'node.deleting',
                style: {
                    opacity: 0.2
                }
            }, {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#4ba6d8'
                }
            }, {
                selector: 'edge.deleting',
                style: {
                    opacity: 0.2
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
        window.cyto = Cyto.cy;
        Cyto.cy.add([{
            data: {
                title: '',
                id: 'preview_source_node',
                background: '#ffffff',
                size: 1,
                borderWidth: 0,
                backgroundImage: []
            },
            group: 'nodes',
            classes: 'hide',
            grabbable: false,
            pannable: false
        }, {
            data: {
                title: '',
                id: 'preview_target_node',
                background: '#ffffff',
                size: 1,
                borderWidth: 0,
                backgroundImage: []
            },
            group: 'nodes',
            classes: 'hide',
            grabbable: false,
            pannable: false
        }, {
            data: {
                id: 'preview_edge',
                source: 'preview_source_node',
                target: 'preview_target_node'
            },
            group: 'edges',
            classes: 'hide preview',
            grabbable: false
        }]);

        Cyto.cy.on('tap', (e) => {
            Cyto.tapHandler(e, Cyto._isEditMode);
        });

        Cyto.cy.on('mouseup', (e) => {
            if (Cyto.isNode(e)) {
                var event = new CustomEvent('dropdown-node', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        position: e.target.position(),
                        nodeId: e.target.id().replace('node-', '')
                    }
                });
                Cyto.cy.container().dispatchEvent(event);
            }
        });

        if (Cyto._isEditMode) {
            Cyto.cy.on('mousedown', Cyto.mousedownInEditModeHandler);
            Cyto.cy.on('mouseup', Cyto.mouseupInEditModeHandler);
            Cyto.cy.on('mousemove', Cyto.mousemoveInEditModeHandler);
        }
        Cyto.cy.on('doubleTap', Cyto.doubleTapHandler)
        Cyto.cy.on('re-arrange', (e) => {
            UI.Cyto.reArrange(Cyto.cy);
        });

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
        Cyto.cy.on('layoutstop', (e) => {
            const nodes = e.target.cy.nodes().filter((node) => {
                if (node.id().indexOf('node-') !== -1) {
                    return true;
                }
                return false;
            }).map((node) => {
                return {
                    id: Number(node.id().replace(/node\-/gi, '')),
                    ...node.position()
                };
            });
            var event = new CustomEvent('layout-done', {
                bubbles: true,
                cancelable: true,
                detail: {
                    nodes
                }
            });
            Cyto.cy.container().dispatchEvent(event);
        });
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
                    borderWidth: borderWidth,
                    backgroundImage: nodes[i].image_filename ? [Image.generateImageUrl(nodes[i].image_filename, 200)] : []
                },
                position: {
                    x: nodes[i].x,
                    y: nodes[i].y
                },
                group: "nodes",
                grabbable: true
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
        UI.Cyto.restorePreviewEdge(Cyto.cy);
        // 複製一份新的 edge 把綠色換成藍色
        const edgeConstructData = data.edgeInstance.json();
        edgeConstructData.data.id = 'edge-' + data.id;
        Cyto.cy.add([
            edgeConstructData
        ]);
        Cyto.cy.remove(data.edgeInstance);
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
        nodeConstructData.data.id = 'node-' + data.id;
        Cyto.cy.add([
            nodeConstructData
        ]);
        Cyto.cy.remove(node);
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
                    node: e.target,
                    position: {
                        x: e.originalEvent.clientX,
                        y: e.originalEvent.clientY
                    }
                }
            });
            Cyto.cy.container().dispatchEvent(event);
        } else if (Cyto.isEdge(e)) {
            const data = e.target.data();
            var event = new CustomEvent('tap-edge', {
                bubbles: true,
                cancelable: true,
                // refactor: 修改為 node 位置
                detail: {
                    id: data.id,
                    edge: e.target,
                    source: data.source,
                    target: data.target
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
            if (sourceId !== targetId) {
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
        }
        Cyto._mousedown = false;
        Cyto._edgeSourceNode = null;
        Cyto._isConnecting = undefined;
        UI.Cyto.hidePreviewEdge(Cyto.cy);
    },
    mousemoveInEditModeHandler: (e) => {
        if (Cyto._isConnecting && !Cyto.isDisableConnecting) {
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
    },
    isEdge: (e) => {
        return (e.target &&
            e.target.isEdge &&
            e.target.isEdge());
    }
};