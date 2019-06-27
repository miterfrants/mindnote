import {
    User
} from '/mindmap/controller/user.js';
import {
    Header
} from '/mindmap/controller/header.js';
import {
    Board
} from '/mindmap/controller/board.js';
import {
    Loader
} from '/mindmap/loader.js';

window['MindMapRoutingLocation'] = [];
window['MindMapController'] = [];
export const Route = {
    _dicReg: [],
    init: (context) => {
        Route.findMatchRouterAndRunController(location.pathname, Route.RoutingTable, context);
        document.addEventListener('DOMNodeInserted', (e) => {
            if (e.target.tagName === 'A') {
                const htmlElement = e.target;
                htmlElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newPath = e.target.href.replace(location.origin, '');
                    Route.findMatchRouterAndRunController(newPath, Route.RoutingTable, context);
                    history.pushState({}, '', newPath);
                    return;
                })
            }
        })
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

                const keys = routingTable[i].path.match(regexp);
                const values = Array.isArray(currentPath) ? currentPath.join('/').match(regexp) : currentPath.match(regexp);

                if (keys.length > 1 && keys.length === values.length) {
                    for (let j = 1; j < keys.length; j++) {
                        const key = keys[j].replace(/{/gi, '').replace(/}/gi, '');
                        const value = values[j];
                        args[key] = value;
                    }
                }

                // execute controller
                if (routingTable[i].dependency) {
                    const loader = new Loader();
                    await loader.load(routingTable[i].dependency);
                }

                const cache = window.MindMapRoutingLocation.filter((location, index) => {
                    const compareResult = (
                        location.controller === routingTable[i].controller &&
                        location.args === JSON.stringify(args)
                    );
                    if (!compareResult && location.controller === routingTable[i].controller) {
                        window.MindMapRoutingLocation.splice(index, 1);
                    }
                    return compareResult;
                });

                if (cache.length === 0) {
                    window.MindMapRoutingLocation.push({
                        controller: routingTable[i].controller,
                        args: JSON.stringify(args)
                    });
                    // 如果已經有 instance 了就不要在執行 init
                    const controller = routingTable[i].controller;

                    const instances = window.MindMapController.filter((instance) => {
                        return instance instanceof routingTable[i].controller
                    })

                    if (instances.length === 0) {
                        const controllerInstance = new routingTable[i].controller(args, context);
                        window.MindMapController.push(controllerInstance);
                    } else {
                        // refactor data from route?
                        instances[0].run(args, instances[0].context);
                    }
                }

                // check is end
                currentPath = currentPath.replace(regexp, '');
                if (currentPath.length === 0) {
                    break;
                }

                // next level
                Route.findMatchRouterAndRunController(currentPath, routingTable[i].RoutingTable, context)
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
    runFromController: (context, path, controller) => {
        const routingTable = Route.RoutingTable.filter((routingTable) => {
            return routingTable.controller === controller;
        });
        if (routingTable.length === 1) {
            const regexp = Route.buildRegExp(routingTable[0]);
            Route.findMatchRouterAndRunController(path.replace(regexp, ''), routingTable[0].RoutingTable, context);
        }
    },
    RoutingTable: [{
        path: '/mindmap/',
        controller: Header,
        dependency: [{
            url: 'https://apis.google.com/js/api.js',
            checkVariable: 'gapi'
        }],
        RoutingTable: [{
            path: 'users/{username}/boards/{boardUniquename}/',
            controller: User,
            dependency: [{
                url: "/mindmap/third-party/cyto/cytoscape.min.js",
                checkVariable: 'cytoscape'
            }],
        }, {
            path: 'boards/{boardUniquename}/',
            controller: Board,
            dependency: [{
                url: "/mindmap/third-party/cyto/cytoscape-cose-bilkent.js",
                dependency: [{
                    url: "/mindmap/third-party/cyto/cytoscape.js",
                    checkVariable: 'cytoscape'
                }]
            }],
        }]
    }]
}