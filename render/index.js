const config = require('./config.js');
const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const DOMParser = require('xmldom').DOMParser;

const imp = require('esm')(module, {
    alias: config.aliases
});
const {
    App
} = imp('./app.js');

const {
    APP_CONFIG
} = imp(config.frontEndRootPath + config.frontEndConfigPath);

const app = new express();

app.get('/mindnote/sitemap.xml', async (request, response, next) => {
    try {
        const filePath = `${__dirname}/sitemap.xml`;
        const bytesFile = fs.readFileSync(filePath);
        const xmlString = new Buffer.alloc(bytesFile.length, bytesFile).toString('ascii');;
        const dom = new DOMParser();
        const doc = dom.parseFromString(xmlString);
        doc.getElementsByTagName('url');
        response.header('Content-Type', 'application/xml');
        const respForBoard = await fetch(`${APP_CONFIG.API_ENDPOINT}boards/sitemap`);
        const dataForBoard = await respForBoard.json();
        const elUrlSet = doc.getElementsByTagName('urlset')[0];
        for (let i = 0; i < dataForBoard.length; i++) {
            const elUrl = doc.createElement('url');
            const elLoc = doc.createElement('loc');
            const elLastmod = doc.createElement('lastmod');

            elLoc.appendChild(doc.createTextNode(`https://sapiens.tools/mindnote/boards/${dataForBoard[i].id}`));
            elLastmod.appendChild(doc.createTextNode(dataForBoard[i].latest_updated_at));

            elUrl.appendChild(elLoc);
            elUrl.appendChild(elLastmod);
            elUrlSet.appendChild(elUrl);
        }

        const respForNode = await fetch(`${APP_CONFIG.API_ENDPOINT}nodes/sitemap`);
        const dataForNode = await respForNode.json();
        for (let i = 0; i < dataForNode.length; i++) {
            const elUrl = doc.createElement('url');
            const elLoc = doc.createElement('loc');
            const elLastmod = doc.createElement('lastmod');

            elLoc.appendChild(doc.createTextNode(`https://sapiens.tools/mindnote/boards/${dataForNode[i].board_id}/nodes/${dataForNode[i].id}`));
            elLastmod.appendChild(doc.createTextNode(dataForNode[i].latest_updated_at));

            elUrl.appendChild(elLoc);
            elUrl.appendChild(elLastmod);
            elUrlSet.appendChild(elUrl);
        }

        response.end(doc.toString());
        next();
    } catch (error) {
        next(error);
    }
});

app.all('*/$', async (request, response, next) => {
    try {
        //reset api cache;
        try {
            const body = await App.routing(request);
            response.send(body);
        } catch (error) {
            // refator: error tracking;
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