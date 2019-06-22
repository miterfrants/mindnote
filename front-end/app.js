import { UI } from '/mindmap/ui.js';
import { DATA } from '/mindmap/data.js';

// double tap node will trigger `double-tap-node` event
export const APP = {
    _isEditMode: false,
    _mousedown : false,
    _edgeSourceNode : null,
    _isConnecting : undefined,
    cy: null,

    _tappedBefore: null, 
    _tappedTimeout: null, // for manual implement double tap
    _editNode: null,
    
    _createNode: null,
    _createNodePositionX: null,
    _createNodePositionY: null,
    init: (container, nodes, relationship, isEditMode) => {
        APP._isEditMode = isEditMode;

        // prepare data
        nodes = nodes.map((node) => {
            const style = UI.getStyle(node.description)
            return {
                ...node,
                style
            }
        });
        const elements = DATA.prepareData(nodes, relationship, isEditMode ? 20 : 0);

        APP.cy = cytoscape({
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
                    'border-color': '#e8844b',
                    'border-opacity': 0.25
                }
            }, {
                selector: '.touch-center',
                style: {
                    'border-color': '#e8844b',
                    'border-opacity': 0.25,
                    'background-color': '#e8844b',
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

        UI.addPreviewEdge(APP.cy);

        APP.cy.on('tap', (e) => {
            APP.tapHandler(e);
            if (APP._isEditMode) {
                APP.tapInEditModeHandler(e);
            }
        });
        if (APP._isEditMode) {
            APP.cy.on('mousedown', APP.mousedownInEditModeHandler);
            APP.cy.on('mouseup', APP.mouseupInEditModeHandler);
            APP.cy.on('mousemove', APP.mousemoveInEditModeHandler);
        }
        APP.cy.on('doubleTap', APP.doubleTapHandler)

        // from index.html
        APP.cy.on('createNode', (e, title, description) => {
            e.position = {
                x: APP._createNodePositionX,
                y: APP._createNodePositionY
            };
            APP.createNodeHandler(e, title, description);
        });
        APP.cy.on('saveNodeDone', APP.saveNodeDoneHandler);
        APP.cy.on('saveEdgeDone', APP.saveEdgeDoneHandler)
        return APP.cy;
    },
    saveEdgeDoneHandler: (e, data) => {
        data.edgeInstance.removeClass('saving');
        data.edgeInstance.data('id', data.id);
    },
    createNodeHandler: (e, title, description) => {
        // fix: 這個會有問題，當create node 很快或是網路很慢，就會造成後面動作產生的 node 取代掉現有的 _createNode 
        APP._createNode = UI.addNode(APP.cy, e.position.x, e.position.y, title, description);
    },
    saveNodeDoneHandler: (e, data) => {
        const node = APP._createNode;
        const style = UI.getStyle(node.data().description);
        for (let key in style) {
            node.data(key, style[key]);
        }
        const nodeConstructData = node.json();
        nodeConstructData.data.id = data.id;
        APP.cy.add([
            nodeConstructData
        ]);
        APP.cy.remove(node);
        APP._isCreating = false;
        APP._createNode = null;
    },
    doubleTapHandler: (e) => {
        if (e.target && e.target.data && e.target.data().id) {
            const data = e.target.data();
            var event = new CustomEvent('double-tap-node', {
                bubbles: true,
                cancelable: true,
                detail: {
                    title: data.title,
                    description: data.description
                }
            });
            APP.cy.container().dispatchEvent(event);
        }
    },
    tapHandler: (e) => {
        let tappedNow = event.target;
        let originalTapEvent;
        if (APP._tappedTimeout && APP._tappedBefore) {
            clearTimeout(APP._tappedTimeout);
        }
        if (APP._tappedBefore === tappedNow) {
            e.target.trigger('doubleTap', e);
            APP._tappedBefore = null;
        } else {
            APP._tappedTimeout = setTimeout(function () { APP._tappedBefore = null; }, 300);
            APP._tappedBefore = tappedNow;
        }
    },
    tapInEditModeHandler: (e) => {
        if (e.target === APP.cy) {
            if (!APP._isCreating) {
                APP._createNode = null;
                APP._createNodePositionX = e.position.x;
                APP._createNodePositionY = e.position.y;
                // refactor: use event listener
                document.querySelector('.title').focus();
                document.querySelector('.btn-add').innerHTML = 'add';
            }
        } else {
            // APP._createNode = e.target;
            const data = e.target.data();
            // refactor: use event listener
            document.querySelector('.title').value = data.title
            document.querySelector('.description').value = data.description
            document.querySelector('.btn-add').innerHTML = 'update';
        }
    },
    mousedownInEditModeHandler: (e) => {
        APP._mousedown = true;
        if (APP.isNode(e)) {
            APP._edgeSourceNode = e.target;
            if (APP._isConnecting !== undefined) {
                return;
            }
            if (UI.isMouseInBorder(e.target, { x: e.position.x, y: e.position.y })) {
                APP._isConnecting = true;
            } else {
                APP._isConnecting = false;
            }
        }
    },
    mouseupInEditModeHandler: (e) => {
        if (
            APP._isConnecting &&
            APP.isNode(e)
        ) {
            const sourceId = APP._edgeSourceNode._private.data.id;
            const targetId = e.target._private.data.id;
            const edgeInstance = UI.addEdge(APP.cy, sourceId, targetId);
            
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
            APP.cy.container().dispatchEvent(event);
        }
        APP._mousedown = false;
        APP._edgeSourceNode = null;
        APP._isConnecting = undefined;
        UI.hidePreviewEdge(APP.cy);
    },
    mousemoveInEditModeHandler: (e) => {
        if (APP._isConnecting) {
            const sourceId = APP._edgeSourceNode._private.data.id;
            UI.updatePreviewEdge(APP.cy, sourceId, e.position);
            UI.showPreviewEdge(APP.cy);
            return;
        }
        if (APP.isNode(e)) {
            UI.clearHoverNodeStyle(APP.cy);
            const node = e.target;
            const isMouseInBorder = UI.isMouseInBorder(node, { x: e.position.x, y: e.position.y });
            if (isMouseInBorder) {
                UI.mouseInBorder(e.target);
            } else {
                UI.mouseInCenter(e.target);
            }
        } else {
            UI.mouseMoveOutNode(APP.cy);
        }
    },
    isNode: (e) => {
        return (e.target &&
        e.target.isNode &&
        e.target.isNode());
    }    
}
