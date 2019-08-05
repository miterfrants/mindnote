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
global.indexHTML = indexHTML;
global.fetch = fetch;
global.HTMLElement = new jsdom.JSDOM('').window.HTMLElement;
const dom = new jsdom.JSDOM(indexHTML);
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
    getItem: (key) => {
        return _localStorageInstance[key];
    },
    setItem: (key, value) => {
        _localStorageInstance[key] = value;
    }
};

const {
    BackendRoute
} = imp('./route.js');

// app express
const app = new express();
app.all('*/$', async (request, response, next) => {
    try {
        //reset api cache;
        window.MindnoteApiCache = {};
        _localStorageInstance = {}

        try {
            const body = await BackendRoute.routing(request, config.frontEndRootPath);
            response.send(body);
        } catch (error) {
            console.log(error);
            response.send(indexHTML.replace(/isServerSideRender = true/, 'isServerSideRender = false'));
        }
        next(null);
    } catch (error) {
        next(error);
    }
});

app.listen(8080, '127.0.0.1');
console.log('Sever Launch');