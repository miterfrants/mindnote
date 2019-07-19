import {
    extendHTMLElementProtoType,
    extendStringProtoType
} from '/mindnote/util/extended-prototype.js';
extendHTMLElementProtoType();
extendStringProtoType();

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
                    description: desc || '',
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
            if (description === undefined || description === '') {
                return {
                    background: '#3897f0',
                    size: 50
                }
            }
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
            //console.log(cy.$('#preview_edge'));
            cy.$('#preview_edge').removeClass('hide');
        },
        updatePreviewEdge: (cy, sourceNodeId, position) => {
            cy.$('#preview_edge').move({
                source: sourceNodeId
            });
            cy.$('#preview_target_node').position({
                x: position.x - 10,
                y: position.y - 10
            });
        },
        restorePreviewEdge: (cy) => {
            cy.$('#preview_edge').move({
                source: '#preview_source_node',
                target: '#preview_target_node'
            });
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
                randomize: true,
                isForce: true
            });
            layout.run();
        },
        switchToDeleteMode: (cy) => {
            cy.nodes().addClass('delete-mode');
            cy.edges().addClass('delete-mode');
        },
        switchToNormalMode: (cy) => {
            cy.nodes().removeClass('delete-mode');
            cy.edges().removeClass('delete-mode');
        },
        updateBackgroundImage: (cy, nodeId, url) => {
            cy.$(`#node-${nodeId}`).style('background-image', url);
        }
    },
    header: {
        showAuth: () => {
            document.querySelectorAll('.header .auth').forEach((ele) => {
                ele.removeClass('hide');
            });
            document.querySelectorAll('.header .unauth').forEach((ele) => {
                ele.addClass('hide');
            });
        },
        hideAuth: () => {
            document.querySelectorAll('.header .auth').forEach((ele) => {
                ele.addClass('hide');
            });
            document.querySelectorAll('.header .unauth').forEach((ele) => {
                ele.removeClass('hide');
            });
        },
        generateBoards: (boards) => {

            const boardsContainer = document.querySelector('.header .boards');
            document.querySelectorAll('.header .boards .menu-item').forEach((el) => {
                if (el.className.split(' ').indexOf('template') === -1) {
                    boardsContainer.removeChild(el);
                }
            })

            const template = document.querySelector('.header .boards .menu-item.template').outerHTML;
            for (let i = 0; i < boards.length; i++) {
                boards[i]['link'] = ['/mindnote/users/me/boards/', boards[i].id, '/'].join('');
                const el = template.bind(boards[i]).toDom()
                el.removeClass('template');
                boardsContainer.appendChild(el);
            }
        },
        generateNavigation: (arrayNavigation) => {
            const arrayNav = [];
            const arrayTitle = [];
            for (let i = 0; i < arrayNavigation.length; i++) {
                if (arrayNavigation[i].link) {
                    arrayNav.push('<a target="_self" href="' + arrayNavigation[i].link + '">' + arrayNavigation[i].title + '</a>');
                } else {
                    arrayNav.push(arrayNavigation[i].title);
                }
                arrayTitle.push(arrayNavigation[i].title);
            }
            document.querySelector('.navigation').innerHTML = arrayNav.join(' > ');

            document.title = arrayTitle.join(' > ') + ' - Mindnote';
        },
        showToggleButton: () => {
            document.querySelector('.toggle-button').removeClass('hide');
        },
        hideToggleButton: () => {
            document.querySelector('.toggle-button').addClass('hide');
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
        document.querySelector('.node-id').value = '';
        UI.nodeForm.exitFullscreen(document.querySelector('.my-board'));

        const mask = document.querySelector('.mask');
        mask.style.opacity = 0;
        setTimeout(() => {
            mask.addClass('hide');
        }, 300);
        UI.nodeForm.resetDragDropState();
    },
    openNodeWindow: (title, description) => {
        const w = 600;
        const dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;

        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const systemZoom = width / window.screen.availWidth;
        const left = (width - w) / 2 / systemZoom + dualScreenLeft
        const top = 0
        const newWindow = window.open('', title, 'id=popup-mindnote, scrollbars=yes, width=' + w / systemZoom + ', height=' + height / systemZoom + ', top=' + top + ', left=' + left);
        const template = [
            '<link rel="stylesheet" type="text/css" href="' + location.origin + '/mindnote/css/common.css">',
            '<div class="md">',
            '<h1>{title}</h1>',
            '{desc}',
            '</div>'
        ].join('');
        const md = window.markdownit();
        const detail = md.render(description);
        const result = template
            .replace(/{title}/gi, title)
            .replace(/{desc}/gi, detail);
        newWindow.document.querySelector("body").innerHTML = result;
        newWindow.document.querySelector("head").innerHTML = "<title>" + title + "</title>"

        // Puts focus on the newWindow
        if (window.focus) newWindow.focus();
    },
    getCytoEditContainer: () => {
        return document.querySelector('.cy-edit-mode');
    },
    getCytoContainer: () => {
        return document.querySelector('.cy');
    },
    generateUserBoards: (boards) => {
        const eles = [];
        const boardsEle = document.querySelector('.my-boards')
        const containerEle = boardsEle.querySelector('.container .row');
        boardsEle.querySelectorAll('.container .row > div:not(.template):not(.btn-virtual-add-board)').forEach((el) => {
            containerEle.removeChild(el);
        });

        const template = containerEle.querySelector('.template').outerHTML;
        for (let i = 0; i < boards.length; i++) {
            boards[i].link = `/mindnote/users/me/boards/${boards[i].id}/`;
            const newItem = template.bind(boards[i]).toDom();
            newItem.removeClass('template');
            containerEle.appendChild(newItem);
            eles.push(newItem);
        }
        return eles;
    },
    addBoard: (board) => {
        const boardsEle = document.querySelector('.my-boards')
        const containerEle = boardsEle.querySelector('.container .row');
        const template = containerEle.querySelector('.template').outerHTML;
        board.link = `/mindnote/users/me/boards/${board.id}/`;
        const newItem = template.bind(board).toDom();
        newItem.removeClass('template');
        containerEle.insertBefore(newItem, containerEle.childNodes[2]);
        return newItem;
    },
    updateBoard: (board) => {
        const boardEl = document.querySelector(`div.board-card[data-id="${board.id}"]`);
        boardEl.querySelector('.title').innerHTML = board.title;
        boardEl.dataset['title'] = board.title;
    },
    removeBoard: (boardId) => {
        const boardEl = document.querySelector(`div.board-card[data-id="${boardId}"]`);
        boardEl.parentElement.removeChild(boardEl);
    },
    setBoardPublicPermission: (elBoardCard, isPublic) => {
        if (isPublic) {
            elBoardCard.removeClass('private');
            elBoardCard.querySelector('.btn-toggle-permission .toggle-button').removeClass('on');
            elBoardCard.querySelector('.permission').innerHTML = '公開';
        } else {
            elBoardCard.addClass('private');
            elBoardCard.querySelector('.btn-toggle-permission .toggle-button').addClass('on');
            elBoardCard.querySelector('.permission').innerHTML = '隱藏';
        }
    },
    showBoardForm: (container) => {
        const title = container.dataset['title'] || '';
        const elBoardTitle = container.querySelector('.board-title')
        elBoardTitle.value = title;
        if (container.classExists('show-form')) {
            container.removeClass('show-form');
        }
        container.addClass('show-form');
        setTimeout(() => {
            elBoardTitle.focus();
            elBoardTitle.setSelectionRange(0, elBoardTitle.value.length);
        }, 300);
    },
    hideBoardForm: (container) => {
        if (container.classExists('show-form')) {
            container.addClass('hide-form');
            setTimeout(() => {
                container.removeClass('show-form');
                container.removeClass('hide-form');
            }, 300)

        }
    },
    unsubscribed: () => {
        document.querySelector('.header .btn-unsubscribe').addClass('hide');
        document.querySelector('.header .btn-subscribe').removeClass('hide');
    },
    unsubscribing: () => {
        document.querySelector('.header .btn-subscribe').addClass('hide');
        document.querySelector('.header .btn-unsubscribe').addClass('hide');
    },
    subscribed: () => {
        document.querySelector('.header .btn-unsubscribe').removeClass('hide');
        document.querySelector('.header .btn-subscribe').addClass('hide');
    },
    switchToDeleteMode: () => {
        const elContainer = document.querySelector('.router-user-board');
        elContainer.addClass('delete-mode');
        elContainer.querySelector('.btn-delete-change').removeClass('hide');
        elContainer.querySelector('.btn-layout').addClass('disabled');
        elContainer.querySelector('.btn-copy-shared-link').addClass('disabled');
        document.querySelector('.btn-switch-delete-mode').addClass('on');
        elContainer.querySelector('.mode-name').innerHTML = '刪除模式';
    },
    switchToNormalMode: () => {
        const elContainer = document.querySelector('.router-user-board');
        elContainer.removeClass('delete-mode');
        elContainer.querySelector('.btn-delete-change').addClass('hide');
        elContainer.querySelector('.btn-layout').removeClass('disabled');
        elContainer.querySelector('.btn-copy-shared-link').removeClass('disabled');
        document.querySelector('.btn-switch-delete-mode').removeClass('on');
        elContainer.querySelector('.mode-name').innerHTML = '一般模式';
    },
    nodeForm: {
        resetDragDropState: () => {
            document.querySelector('.node-form .drag-overlay').addClass('hide');
            document.querySelector('.node-form .drag-overlay-detail-section').addClass('hide');
            document.querySelector('.node-form .drag-overlay-detail-section .drop-to-upload-cover').removeClass('drag-enter');
            document.querySelector('.node-form .drag-overlay-detail-section .drop-to-upload-description').removeClass('drag-enter');
        },
        dragStart: () => {
            document.querySelector('.node-form .drag-overlay').removeClass('hide');
            document.querySelector('.node-form .drag-overlay-detail-section').addClass('hide');
        },
        dragEnterDetail: () => {
            document.querySelector('.node-form .drag-overlay').addClass('hide');
            document.querySelector('.node-form .drag-overlay-detail-section').removeClass('hide');
        },
        dragEnterUploadCover: () => {
            document.querySelector('.node-form .drop-to-upload-cover').addClass('drag-enter');
        },
        dragLeaveUploadCover: () => {
            document.querySelector('.node-form .drop-to-upload-cover').removeClass('drag-enter');
        },
        dragEnterUploadDescriptionImage: () => {
            document.querySelector('.node-form .drop-to-upload-description').addClass('drag-enter');
        },
        dragLeaveUploadDescriptionImage: () => {
            document.querySelector('.node-form .drop-to-upload-description').removeClass('drag-enter');
        },
        enterFullscreen: (container) => {
            container.querySelector('.node-form').addClass('fullscreen');
            container.querySelector('.btn-fullscreen').removeClass('fa-expand-arrows-alt');
            container.querySelector('.btn-fullscreen').addClass('fa-compress-arrows-alt');
        },
        exitFullscreen: (container) => {
            container.querySelector('.node-form').removeClass('fullscreen');
            container.querySelector('.btn-fullscreen').addClass('fa-expand-arrows-alt');
            container.querySelector('.btn-fullscreen').removeClass('fa-compress-arrows-alt');
        }
    }
}