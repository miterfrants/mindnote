const config = require('./config.js');
const fakeBrowser = require('./fake-browser.js');
fakeBrowser.init();
const imp = require('esm')(module, {
    alias: config.aliases
});

const {
    RESPONSE_STATUS,
    API
} = imp(config.frontEndRootPath + '/constants.js');

const {
    Router
} = imp(config.frontEndRootPath + '/route/router.js');

const {
    Route
} = imp(config.frontEndRootPath + '/route/route.js');

const {
    api
} = imp(config.frontEndRootPath + '/service/api.v2.js');

const {
    APP_CONFIG
} = imp(config.frontEndRootPath + config.frontEndConfigPath);

export const App = {
    routing: async (request) => {
        fakeBrowser.reset(request);

        // replace routing rule url for server-side render
        recursiveReplaceRouterHTMLTemplate(Router, [{
            sourcePath: '/mindnote/',
            destinationPath: config.relativeFrontEndURL
        }]);

        // initialize api url
        api.initV2(APP_CONFIG.API_ENDPOINT, API, RESPONSE_STATUS);

        const context = {
            isServerSideRender: true,
            isUpdateDOMFirstRunRouting: true
        };

        // use front-end routing
        await Route.routing(request.url, Router, context, null, null);
        fakeBrowser.writeApiCacheToFrontEnd();
        fakeBrowser.writeStyleSheetCacheToFrontEnd();

        return window.document.documentElement.innerHTML;
    }
}

function recursiveReplaceRouterHTMLTemplate(Router, aliases) {
    for (var i = 0; i < Router.length; i++) {
        if (Router[i].html) {
            Router[i].html = replaceAlias(Router[i].html, aliases);
        }
        if (Router[i].Router) {
            recursiveReplaceRouterHTMLTemplate(Router[i].Router, aliases);
        }
    }
}

function replaceAlias(sourcePath, aliases) {
    for (let i = 0; i < aliases.length; i++) {
        sourcePath = sourcePath.replace(aliases[i].sourcePath, aliases[i].destinationPath);
    }
    return sourcePath;
}