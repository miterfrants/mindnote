import {
    UserBoard
} from '/mindmap/controller/user-board.js';

import {
    Header
} from '/mindmap/controller/header.js';

import {
    Board
} from '/mindmap/controller/board.js';

import {
    Checkout
} from '/mindmap/controller/checkout.js';

import {
    UserBoards
} from '/mindmap/controller/user-boards.js';

import {
    Loader
} from '/mindmap/loader.js';

import {
    api
} from '/mindmap/service/api.v2.js';

import {
    RESPONSE_STATUS
} from '/mindmap/config.js';

import {
    MindmapError,
    MINDMAP_ERROR_TYPE
} from '/mindmap/util/mindmap-error.js';

import {
    Toaster
} from '/mindmap/service/toaster.js';

window['MindmapController'] = [];

export const Route = {
    init: (context) => {
        window.addEventListener("popstate", function (e) {
            Route.findMatchRouterAndRunController(location.pathname, Route.RoutingTable, context);
        });

        (function (original) {
            history.pushState = function (data, title, newPath) {
                Route.findMatchRouterAndRunController(newPath, Route.RoutingTable, context);
                return original.apply(this, arguments);
            };
        })(history.pushState);

        Route.findMatchRouterAndRunController(location.pathname, Route.RoutingTable, context);

        // overwrite link tag original behavior
        document.querySelectorAll('a').forEach((el) => {
            el.addEventListener('click', overWriteLinkBehavior)
        });

        document.addEventListener('DOMNodeInserted', (e) => {
            if (e.target.tagName === 'A') {
                const htmlElement = e.target;
                htmlElement.addEventListener('click', overWriteLinkBehavior)
            } else if (e.target.querySelectorAll && e.target.querySelectorAll('a').length > 0) {
                e.target.querySelectorAll('a').forEach((el) => {
                    el.addEventListener('click', overWriteLinkBehavior);
                })
            }
        });

        function overWriteLinkBehavior(e) {
            e.preventDefault();
            e.stopPropagation();
            const newPath = e.currentTarget.href.replace(location.origin, '');
            history.pushState({}, '', newPath);
            return;
        }
    },
    findMatchRouterAndRunController: async (currentPath, routingTable, context, args) => {
        for (let i = 0; i < routingTable.length; i++) {
            const regexp = Route.buildRegExp(routingTable[i]);
            if (regexp.test(currentPath)) {
                if (args === undefined) {
                    args = {
                        token: localStorage.getItem('token')
                    }
                }

                args = {
                    ...args,
                    ...Route.extractVariableFromUrl(routingTable[i].path, currentPath, regexp)
                };

                if (routingTable[i].dependency) {
                    const loader = new Loader();
                    await loader.load(routingTable[i].dependency);
                }

                // 如果有一個 prepare data 是空的就只執行自己不，往下執行
                let isNextLevel = true;
                if (routingTable[i].prepareData) {
                    for (let j = 0; j < routingTable[i].prepareData.length; j++) {
                        const prepareData = await routingTable[i].prepareData[j].func(args);
                        if (prepareData === null || prepareData === undefined) {
                            isNextLevel = false;
                        }
                        args[routingTable[i].prepareData[j].key] = prepareData;
                    }
                }

                window.MindmapRoutingLocation.push({
                    controller: routingTable[i].controller,
                    args: JSON.stringify(args)
                });

                // 如果已經有 instance 了就不要在執行 init
                const instances = window.MindmapController.filter((instance) => {
                    return instance instanceof routingTable[i].controller
                })

                // execute controller
                // display controller html
                const className = routingTable[i].controller.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                document.querySelectorAll(`.router-${className}`).forEach((el) => {
                    el.removeClass('hide');
                });
                document.querySelectorAll(`div[class^="router-"]:not(.router-${className})`).forEach((el) => {
                    el.addClass('hide');
                })

                if (instances.length === 0) {
                    // check pre function exists
                    const controllerInstance = new routingTable[i].controller(args, context);
                    window.MindmapController.push(controllerInstance);
                } else {
                    // refactor data from route?
                    instances[0].run(args, instances[0].context);
                }

                // check is end
                currentPath = currentPath.replace(regexp, '');
                if (currentPath.length === 0) {
                    break;
                }

                // next level
                if (isNextLevel) {
                    Route.findMatchRouterAndRunController(currentPath, routingTable[i].RoutingTable, context, args)
                }
                break;
            }
        }
    },
    buildRegExp: (routingTable) => {
        const arrayOfPath = routingTable.path.split('/')
        const arrayRegString = [];
        const arrayQueryStringKey = [];
        for (let j = 0; j < arrayOfPath.length; j++) {
            if (arrayOfPath[j].substring(0, 1) === '{') {
                arrayQueryStringKey.push(arrayOfPath[j].replace(/{/gi, '').replace(/}/gi, ''))
                arrayRegString.push('([0-9|a-z|A-Z|_|-|{|}]+)')
            } else {
                arrayRegString.push(arrayOfPath[j]);
            }
        }
        if (routingTable.RoutingTable) {
            return new RegExp('^' + arrayRegString.join('\\/'));
        } else {
            return new RegExp('^' + arrayRegString.join('\\/') + '$');
        }
    },
    extractVariableFromUrl: (path, currentPath, regexp) => {
        const keys = path.match(regexp);
        const values = Array.isArray(currentPath) ? currentPath.join('/').match(regexp) : currentPath.match(regexp);
        const args = {};
        if (keys.length > 1 && keys.length === values.length) {
            for (let j = 1; j < keys.length; j++) {
                const key = keys[j].replace(/{/gi, '').replace(/}/gi, '');
                const value = values[j];
                args[key] = value;
            }
        }
        return args;
    },
    runFromController: (context, path, controller) => {
        const routingTable = Route.RoutingTable.filter((routingTable) => {
            return routingTable.controller === controller;
        });
        if (routingTable.length === 1) {
            Route.findMatchRouterAndRunController(path, routingTable, context);
        }
    },
    RoutingTable: [{
        path: '/mindmap/',
        controller: Header,
        dependency: [{
            url: 'https://apis.google.com/js/api.js',
            checkVariable: 'gapi'
        }],
        prepareData: [{
            key: 'me',
            func: async (args) => {
                const resp = await api.authApiService.me.get({
                    token: args.token
                });
                if (resp.status === RESPONSE_STATUS.OK) {
                    return resp.data;
                } else {
                    if (resp.httpStatus === 401 || resp.httpStatus === 403) {
                        Toaster.popup(MINDMAP_ERROR_TYPE.WARN, resp.data.errorMsg);
                    } else {
                        throw new MindmapError(MINDMAP_ERROR_TYPE.ERROR, resp.data.errorMsg);
                    }
                }
            }
        }],
        RoutingTable: [{
            path: 'users/me/boards/',
            controller: UserBoards
        }, {
            path: 'users/me/boards/{boardId}/',
            controller: UserBoard,
            dependency: [{
                type: 'script',
                url: "/mindmap/third-party/cyto/cytoscape.min.js",
                checkVariable: 'cytoscape'
            }]
        }, {
            path: 'boards/{boardId}/',
            controller: Board,
            dependency: [{
                type: 'script',
                url: "/mindmap/third-party/cyto/cytoscape.min.js",
                checkVariable: 'cytoscape'
            }]
        }, {
            path: 'checkout/',
            controller: Checkout,
            dependency: [{
                url: 'https://js.tappaysdk.com/tpdirect/v5.1.0',
                checkVariable: 'TPDirect'
            }],
        }]
    }]
}