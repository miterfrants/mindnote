var fs = require("fs");
const frontEndRootPath = __dirname.substring(0, __dirname.lastIndexOf('/') + 1) + 'front-end/';
const express = require('express');
const jsdom = require("jsdom");
const fetch = require('node-fetch');
const aliases = [{
    sourcePath: /^\/mindnote\//gi,
    destinationPath: frontEndRootPath
}];
const imp = require('esm')(module, {
    alias: aliases
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// pseudo browser 
const indexHTML = fs.readFileSync(frontEndRootPath + 'index.html', 'utf8');
const dom = new jsdom.JSDOM(indexHTML);
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.fetch = fetch;
global.window = {
    document: global.document
};
_localStorageInstance = {}
global.localStorage = {
    getItem: (key) => {
        return _localStorageInstance[key];
    },
    setItem: (key, value) => {
        _localStorageInstance[key] = value;
    }
}

// app express
const app = new express();
const {
    Router
} = imp(frontEndRootPath + '/route/router.js');

const {
    Route
} = imp(frontEndRootPath + '/route/route.js');

const {
    api
} = imp(frontEndRootPath + '/service/api.v2.js');

const configPath = process.env.NODE_ENV === 'prod' ? '/config.js' : '/config.dev.js';
const aliasURL = process.env.NODE_ENV === 'prod' ? 'http://127.0.0.1/' : 'https://127.0.0.1/';

const {
    RESPONSE_STATUS,
    API
} = imp(frontEndRootPath + configPath);

app.all('*/$', async (request, response, next) => {
    try {
        global.location = request._parsedUrl;
        /* pre */
        // initialize html
        const elementToaster = dom.window.document.querySelector('.toaster');
        if (elementToaster) {
            elementToaster.innerHTML = '';
        }
        dom.window.document.querySelectorAll('#MindnoteApiCache').forEach((el) => {
            el.parentElement.removeChild(el);
        });

        // setup localstorage
        localStorage.setItem('token', getCookie(request.header('cookie') || '', 'token'));

        // modify routing rule for server-side render
        recursiveReplaceRouter(Router, [{
            sourcePath: '/mindnote/',
            destinationPath: aliasURL
        }]);

        // initialize api url
        api.init(API, RESPONSE_STATUS);


        await Route.routing(request.url, Router, {
            isServerSideRender: true
        }, null, null, null, true);

        /* post */
        const script = dom.window.document.createElement('script');
        script.id = 'MindnoteApiCache';
        script.innerHTML = 'window["MindnoteApiCache"] = ' + JSON.stringify(global.window.MindnoteApiCache);
        dom.window.document.querySelector('head').prepend(script);

        response.send(dom.window.document.documentElement.innerHTML);
        next(null);
    } catch (error) {
        next(error);
    }
});

app.listen(8080, '127.0.0.1');

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