const config = require('./config.js');
const express = require('express');
const imp = require('esm')(module, {
    alias: config.aliases
});
const {
    App
} = imp('./app.js');

const app = new express();
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