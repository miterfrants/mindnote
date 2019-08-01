const config = require('./config.js');
const express = require('express');
const jsdom = require("jsdom");
const fetch = require('node-fetch');
const fs = require("fs");
const imp = require('esm')(module, {
    alias: config.aliases
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// pseudo browser 
const indexHTML = fs.readFileSync(config.frontEndRootPath + 'index.html', 'utf8');
const dom = new jsdom.JSDOM(indexHTML);
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.fetch = fetch;
global.window = dom.window;
_localStorageInstance = {}
global.localStorage = {
    getItem: (key) => {
        return _localStorageInstance[key];
    },
    setItem: (key, value) => {
        _localStorageInstance[key] = value;
    }
}

const {
    BackendRoute
} = imp('./route.js');

// app express
const app = new express();
app.all('*/$', async (request, response, next) => {
    try {
        const body = await BackendRoute.routing(request, config.frontEndRootPath);
        response.send(body);
        next(null);
    } catch (error) {
        next(error);
    }
});

app.listen(8080, '127.0.0.1');
console.log('Sever Launch');