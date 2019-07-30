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

const {
    RESPONSE_STATUS,
    API
} = imp(frontEndRootPath + '/config.js');

app.all('*/$', async (request, response, next) => {
    try {
        global.location = request._parsedUrl;
        localStorage.setItem('token', getCookie(request.header('cookie'), 'token'));
        recursiveReplaceRouter(Router, [{
            sourcePath: '/mindnote/',
            destinationPath: 'https://127.0.0.1/'
        }]);
        api.init(API, RESPONSE_STATUS);
        Route.routing(request.url, Router, {
            isServerSideRender: true
        }, null, null, null, true);
        response.send(dom.window.document.querySelector('html').innerHTML);
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