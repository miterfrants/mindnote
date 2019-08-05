'use strict';
const http = require('https');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});
const staticAlias = require('node-static-alias');
const fs = require('fs');
var fileServer = new staticAlias.Server('./', {
    alias: [
        //     {
        //     match: /\/mindnote\/([a-z|A-Z|\-|_|0-9]+\/){0,}$/,
        //     serve: 'index.html'
        // }, 
        {
            match: /\/mindnote\/config.js$/,
            serve: process.env.NODE_ENV === 'prod' ? 'config.js' : 'config.dev.js'
        }, {
            match: /\/mindnote\/([^/]+\/)*([^/]+)\.(js|css|png|woff2|woff|ttf|html|gif|svg|json|jpg)$/,
            serve: function (params) {
                return params.reqPath.replace(/mindnote\//gi, '').substring(1);
            },
        }
    ]
});

const options = {
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/server.crt')
};

http.createServer(options, function (request, response) {
    request.addListener('end', function () {
        let regexp = new RegExp(/\/mindnote\/([a-z|A-Z|\-|_|0-9]+\/){0,}(\?.*)?$/, 'gi');

        if (regexp.test(request.url)) {
            return proxy.web(request, response, {
                target: 'http://127.0.0.1:8080'
            });
        } else {
            fileServer.serve(request, response);
        }
    }).resume();
}).listen(443);
console.log('Sever Launch');