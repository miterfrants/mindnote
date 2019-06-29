'use strict';
const http = require('https');
const staticAlias = require('node-static-alias');
const fs = require('fs');

var fileServer = new staticAlias.Server('./', {
  alias: [{
    match: /\/mindmap\/([a-z|A-Z|\-|_|0-9]+\/){0,}$/,
    serve: 'index.html'
  }, {
    match: /\/mindmap\/config.js$/,
    serve: 'config.dev.js'
  }, {
    match: /\/mindmap\/([^\/]+\/)*([^\/]+)\.(js|css|png|woff2|woff|ttf)$/,
    serve: function (params) {
      return params.reqPath.replace(/mindmap\//gi, '').substring(1);
    },
  }]
});

const options = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/server.crt')
};

const server = http.createServer(options, function (request, response) {
  request.addListener('end', function () {
    fileServer.serve(request, response);
  }).resume();
}).listen(443);

console.log('Sever Launch');