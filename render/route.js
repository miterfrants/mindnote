const config = require('./config.js');
const imp = require('esm')(module, {
    alias: config.aliases
});

// config
const frontEndConfigPath = process.env.NODE_ENV === 'prod' ? '/config.js' : '/config.dev.js';
const aliasURL = process.env.NODE_ENV === 'prod' ? 'http://127.0.0.1/' : 'https://127.0.0.1/';

// import from front-end
const {
    RESPONSE_STATUS,
    API
} = imp(config.frontEndRootPath + 'constants.js');

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
} = imp(config.frontEndRootPath + frontEndConfigPath);

export const BackendRoute = {
    routing: async (request) => {
        global.location = request._parsedUrl;
        /* pre */
        // initialize html
        const elementToaster = window.document.querySelector('.toaster');
        if (elementToaster) {
            elementToaster.innerHTML = '';
        }
        window.document.querySelectorAll('#Mindnote').forEach((el) => {
            el.parentElement.removeChild(el);
        });
        window.document.querySelector('head title').innerHTML = '';
        global.window.MindnoteController = [];
        global.window.MindnoteCurrentController = null;

        // setup localstorage
        localStorage.setItem('token', getCookie(request.header('cookie') || '', 'token'));

        // modify routing rule for server-side render
        recursiveReplaceRouter(Router, [{
            sourcePath: '/mindnote/',
            destinationPath: aliasURL
        }]);

        // initialize api url
        api.initV2(APP_CONFIG.API_ENDPOINT, API, RESPONSE_STATUS);
        const app = {
            isServerSideRender: true,
            isUpdateDOMFirstRunRouting: true
        };

        await Route.routing(request.url, Router, app, null, null);

        /* post */
        // mindnote api cache
        const script = window.document.createElement('script');
        const scriptsArray = [];
        script.id = 'Mindnote';
        scriptsArray.push('window["MindnoteApiCache"] = ' + JSON.stringify(global.window.MindnoteApiCache));
        script.innerHTML = scriptsArray.join('\r\n');
        window.document.querySelector('head').prepend(script);
        return window.document.documentElement.innerHTML;
    }
}

function recursiveReplaceRouter(Router, aliases) {
    for (var i = 0; i < Router.length; i++) {
        if (Router[i].html) {
            Router[i].html = replaceAlias(Router[i].html, aliases);
        }
        if (Router[i].Router) {
            recursiveReplaceRouter(Router[i].Router, aliases);
        }
    }
}

function replaceAlias(sourcePath, aliases) {
    for (let i = 0; i < aliases.length; i++) {
        sourcePath = sourcePath.replace(aliases[i].sourcePath, aliases[i].destinationPath);
    }
    return sourcePath;
}

function getCookie(cookies, name) {
    var nameEQ = name + "=";
    var ca = cookies.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}