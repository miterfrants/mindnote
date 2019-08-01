import {
    Loader
} from '/mindnote/util/loader.js';

import {
    Router
} from '/mindnote/route/router.js';

window['MindnoteController'] = [];
window['MindnoteCurrentController'] = null;

export const Route = {
    init: (context) => {
        window.addEventListener('popstate', function () {
            Route.routing(location.pathname, Router, context);
        });

        (function (original) {
            history.pushState = function (data, title, newPath) {
                Route.routing(newPath, Router, context);
                return original.apply(this, arguments);
            };
        })(history.pushState);

        (function (original) {
            history.replaceState = function (data, title, newPath) {
                Route.routing(newPath, Router, context);
                return original.apply(this, arguments);
            };
        })(history.replaceState);

        Route.routing(location.pathname, Router, context);

        // overwrite link tag original behavior
        document.querySelectorAll('a').forEach((el) => {
            el.addEventListener('click', overWriteLinkBehavior);
        });

        document.addEventListener('DOMNodeInserted', (e) => {
            if (e.target.tagName === 'A') {
                const htmlElement = e.target;
                htmlElement.addEventListener('click', overWriteLinkBehavior);
            } else if (e.target.querySelectorAll && e.target.querySelectorAll('a').length > 0) {
                e.target.querySelectorAll('a').forEach((el) => {
                    el.addEventListener('click', overWriteLinkBehavior);
                });
            }
        });

        function overWriteLinkBehavior(e) {
            if (e.currentTarget && e.currentTarget.href) {
                if (e.currentTarget.href.indexOf(location.origin) === -1) {
                    return;
                }
            }
            e.preventDefault();
            e.stopPropagation();
            const newPath = e.currentTarget.href.replace(location.origin, '');
            history.pushState({}, '', newPath);
            return;
        }
    },
    routing: async (path, routers, context, args, pMatchRouter, pParentController) => {
        if (window.MindnoteCurrentController) {
            Route.recurisvieExitController(window.MindnoteCurrentController);
        }
        const matchRouter = pMatchRouter ? pMatchRouter : Route.findMatchRoute(path, routers);
        const isEnd = matchRouter.Router === undefined;

        const regexp = Route.buildRegExp(matchRouter.path, isEnd);
        args = {
            ...args,
            ...Route.extractVariableFromUrl(matchRouter.path, path, regexp)
        };

        // load dependency
        if (!context.isServerSideRender) {
            const loader = new Loader();
            if (matchRouter.dependency) {
                await loader.load(matchRouter.dependency);
            }
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
        let htmlPath = null;
        if (matchRouter.html) {
            htmlPath = matchRouter.html;
        }

        // assign parent controller to next level controller instance
        const parentController = await Route.executeController(matchRouter.controller, args, context, htmlPath, pParentController);
        // next routing
        const currentPath = path.replace(regexp, '');
        // is end
        if (currentPath.length === 0) {
            document.querySelectorAll('.child-router').forEach((el) => {
                el.style.visibility = '';
            });

            // refactor: use event listener
            context.isUpdateDOM = true; // eslint-disable-line
            // exit routing
            return;
        }
        const nextMatchRouter = Route.findMatchRoute(currentPath, matchRouter.Router);
        if (
            !nextMatchRouter.isRequiredParentPrepareData ||
            (nextMatchRouter.isRequiredParentPrepareData === true && !someThingWrongInPrepareData)
        ) {
            await Route.routing(currentPath, matchRouter.Router, context, args, nextMatchRouter, parentController);
        }
    },
    findMatchRoute: (currentPath, routers) => {
        for (let i = 0; i < routers.length; i++) {
            const path = routers[i].path;
            const isEnd = routers[i].Router === undefined;
            const regexp = Route.buildRegExp(path, isEnd);
            if (regexp.test(currentPath)) {
                return routers[i];
            }
        }
    },

    // server site: constructor -> render
    // client sit: constructor-> init -> enter -> render -> exit
    executeController: async (controller, args, context, htmlPath, parentController) => {
        // 如果已經有 instance 就不要在執行 initalize
        const instances = window.MindnoteController.filter((instance) => {
            return instance instanceof controller;
        });

        let controllerInstance = null;
        let elHTML = null;
        if (instances.length === 0) {
            if (htmlPath) {
                const resp = await fetch(htmlPath);
                const html = await resp.text();
                elHTML = html.toDom();
            }
            controllerInstance = new controller(elHTML, parentController, args, context);
            if (!context.isServerSideRender && controllerInstance.init) {
                controllerInstance.init(args, context);
            }
            window.MindnoteController.push(controllerInstance);
        } else {
            controllerInstance = instances[0];
        }

        window.MindnoteCurrentController = controllerInstance; // eslint-disable-line
        if (!context.isServerSideRender) {
            await controllerInstance.enter(args);
            if (controllerInstance.render) {
                await controllerInstance.render();
            }
            if (controllerInstance.postRender) {
                await controllerInstance.postRender();
            }
        } else if (controllerInstance.render) {
            await controllerInstance.render(true);
        }

        return controllerInstance;
    },
    recurisvieExitController: (controllerInstance) => {
        controllerInstance.exit();
        if (controllerInstance.parentController) {
            Route.recurisvieExitController(controllerInstance.parentController);
        }
    },
    prepareData: (prepareFuncs, args) => {
        return new Promise(async (resolve) => { // eslint-disable-line
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
        const arrayOfPath = path.split('/');
        const arrayRegString = [];
        const arrayQueryStringKey = [];
        for (let j = 0; j < arrayOfPath.length; j++) {
            if (arrayOfPath[j].substring(0, 1) === '{') {
                arrayQueryStringKey.push(arrayOfPath[j].replace(/{/gi, '').replace(/}/gi, ''));
                arrayRegString.push('([0-9|a-z|A-Z|_|-|{|}]+)');
            } else {
                arrayRegString.push(arrayOfPath[j]);
            }
        }
        if (isEnd) {
            return new RegExp('^' + arrayRegString.join('\\/') + '(\\?.*)?$');
        } else {
            return new RegExp('^' + arrayRegString.join('\\/'));
        }
    },
    extractVariableFromUrl: (routingPath, currentPath, regexp) => {
        const keys = routingPath.match(regexp);
        const values = Array.isArray(currentPath) ? currentPath.join('/').match(regexp) : currentPath.match(regexp);
        const args = {};
        if (keys !== undefined && keys.length > 1 && keys.length === values.length) {
            for (let j = 1; j < keys.length; j++) {
                if (keys[j] === undefined) {
                    continue;
                }
                const key = keys[j].replace(/{/gi, '').replace(/}/gi, '');
                const value = values[j];
                args[key] = value;
            }
        }
        return args;
    },
    runFromController: (context, path, controller) => {
        const routers = Router.filter((routers) => {
            return routers.controller === controller;
        });
        if (routers.length === 1) {
            Route.routing(path, routers, context);
        }
    }
};