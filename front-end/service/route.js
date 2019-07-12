import {
    Loader
} from '/mindmap/util/loader.js';

import {
    Router
} from '/mindmap/router.js';

window['MindmapController'] = [];

export const Route = {
    init: (context) => {
        window.addEventListener("popstate", function (e) {
            Route.routing(location.pathname, Router, context);
        });

        (function (original) {
            history.pushState = function (data, title, newPath) {
                Route.routing(newPath, Router, context);
                return original.apply(this, arguments);
            };
        })(history.pushState);

        Route.routing(location.pathname, Router, context);

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
    routing: async (path, routingTable, context, args, pMatchRouter) => {
        const matchRouter = pMatchRouter ? pMatchRouter : Route.findMatchRoute(path, routingTable);
        const isEnd = matchRouter.Router === undefined
        const regexp = Route.buildRegExp(matchRouter.path, isEnd);
        args = {
            ...args,
            ...Route.extractVariableFromUrl(matchRouter.path, path, regexp)
        };

        // load dependency
        const loader = new Loader();
        if (matchRouter.dependency) {
            await loader.load(matchRouter.dependency);
        }

        // prepare data
        let someThingWrongInPrepareData = true;
        if (matchRouter.prepareData) {
            const result = await Route.prepareData(matchRouter.prepareData, args);
            someThingWrongInPrepareData = result.someThingWrongInPrepareData;
            args = {
                ...args,
                ...result.data
            };
        }

        // execute controller
        Route.executeController(matchRouter.controller, args, context)

        // next routing
        const currentPath = path.replace(regexp, '');
        if (currentPath.length === 0) {
            // exit routing
            return;
        }
        const nextMatchRouter = Route.findMatchRoute(currentPath, matchRouter.Router);
        if (
            !nextMatchRouter.isRequiredParentPrepareData ||
            (nextMatchRouter.isRequiredParentPrepareData === true && !someThingWrongInPrepareData)
        ) {
            Route.routing(currentPath, matchRouter.Router, context, args, nextMatchRouter)
        }
    },
    findMatchRoute: (currentPath, routingTable) => {
        for (let i = 0; i < routingTable.length; i++) {
            const path = routingTable[i].path;
            const isEnd = routingTable[i].Router === undefined
            const regexp = Route.buildRegExp(path, isEnd);
            if (regexp.test(currentPath)) {
                return routingTable[i];
            }
        }
    },
    executeController: (controller, args, context) => {
        // 如果已經有 instance 就不要在執行 initalize
        const instances = window.MindmapController.filter((instance) => {
            return instance instanceof controller
        })
        // refactor: 修改成 controller 有自己的 html 
        const className = controller.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        document.querySelectorAll(`.router-${className}`).forEach((el) => {
            el.removeClass('hide');
        });
        document.querySelectorAll(`div[class^="router-"]:not(.router-${className})`).forEach((el) => {
            el.addClass('hide');
        });

        if (instances.length === 0) {
            // check pre function exists
            const controllerInstance = new controller(args, context);
            window.MindmapController.push(controllerInstance);
        } else {
            // refactor data from route?
            if (instances[0].run) {
                instances[0].run(args, instances[0].context);
            }
        }
    },
    prepareData: async (prepareFuncs, args) => {
        return new Promise(async (resolve, reject) => {
            let someThingWrongInPrepareData = false;
            const data = {};
            const tempArgs = {
                ...args
            };
            for (let i = 0; i < prepareFuncs.length; i++) {
                const prepareData = await prepareFuncs[i].func(tempArgs);
                if (prepareData === null || prepareData === undefined) {
                    someThingWrongInPrepareData = true;
                }
                const key = prepareFuncs[i].key;
                tempArgs[key] = prepareData;
                data[key] = prepareData;
            }
            resolve({
                someThingWrongInPrepareData,
                data
            });
        });
    },
    buildRegExp: (path, isEnd) => {
        const arrayOfPath = path.split('/')
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
        if (isEnd) {
            return new RegExp('^' + arrayRegString.join('\\/') + '$');
        } else {
            return new RegExp('^' + arrayRegString.join('\\/'));
        }
    },
    extractVariableFromUrl: (routingPath, currentPath, regexp) => {
        const keys = routingPath.match(regexp);
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
        const routingTable = Router.filter((routingTable) => {
            return routingTable.controller === controller;
        });
        if (routingTable.length === 1) {
            Route.routing(path, routingTable, context);
        }
    }
}