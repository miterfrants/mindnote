'use strict';

const http = require('http');
const staticAlias = require('node-static-alias');
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

const server = http.createServer(function (request, response) {
  request.addListener('end', function () {
    fileServer.serve(request, response);
  }).resume();
}).listen(80);

console.log('Sever Launch');