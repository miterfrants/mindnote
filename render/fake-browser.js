const fetch = require('node-fetch');
const jsdom = require('jsdom');
const config = require('./config.js');
const fs = require("fs");

// fake browser
const indexHTML = fs.readFileSync(config.frontEndRootPath + 'index.html', 'utf8');

module.exports = {
    init,
    reset,
    writeApiCacheToFrontEnd
}

function init() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    global.indexHTML = indexHTML;
    global.fetch = fetch;
    global.HTMLElement = new jsdom.JSDOM('').window.HTMLElement;
    const dom = new jsdom.JSDOM(indexHTML);
    global.window = dom.window;
    global.document = dom.window.document;
    global._localStorageInstance = {};
    global.localStorage = {
        getItem: (key) => {
            return _localStorageInstance[key];
        },
        setItem: (key, value) => {
            _localStorageInstance[key] = value;
        }
    };
}

function reset(request) {
    global.location = request._parsedUrl;
    global.location.href = 'https://' + request.headers.host + global.location.href;
    global.window.MindnoteApiCache = {};
    global._localStorageInstance = {}
    global.window.MindnoteController = [];
    global.window.MindnoteCurrentController = null;

    // initialize html
    const elementToaster = window.document.querySelector('.toaster');
    if (elementToaster) {
        elementToaster.innerHTML = '';
    }
    window.document.querySelectorAll('#Mindnote').forEach((el) => {
        el.parentElement.removeChild(el);
    });
    window.document.querySelector('head title').innerHTML = '';

    // setup fake localstorage 
    localStorage.setItem('token', _getCookie(request.header('cookie') || '', 'token'));
}

function writeApiCacheToFrontEnd() {
    // mindnote api cache
    const script = window.document.createElement('script');
    const scriptsArray = [];
    script.id = 'Mindnote';
    scriptsArray.push('window["MindnoteApiCache"] = ' + JSON.stringify(global.window.MindnoteApiCache));
    script.innerHTML = scriptsArray.join('\r\n');
    window.document.querySelector('head').prepend(script);
}

function _getCookie(cookies, name) {
    var nameEQ = name + "=";
    var ca = cookies.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}