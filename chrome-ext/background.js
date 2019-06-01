/**
 * Constant
 */
const API = {
  ENDPOINT: 'https://sapiens.tools/mindmap/api/v1/',
  CONTROLLER: {
    NODES: 'nodes/',
    USERS: 'users/',
    AUTH: 'auth/'
  }
};

const RESPONSE_STATUS = {
  OK: 'OK',
  FAILED: 'FAILED',
}

const ERROR = {
  AUTH: {

  }
}

const NODE_HISTORY_LIMIT = 5;

/**
 * Controller
 */

const controller = {
  node: {
    post: function (request, sender, sendResponse) {
      // as sendResponse not wokring after await
      // so use traditional callback function 
      chrome.storage.sync.get(['token'], function (data) {
        if (data.token) {
          postNode(data.token, request.title, request.description, function (response) {
            appendNodeHistory(response.data)
            sendResponse('OK');
          })
        } else {
          alert("un-auth please auth before");
        }
      });
      return true;
    }
  },
  auth: async function (request, sender, sendResponse) {
    var authResult = await authAsync();
    if (authResult.status === RESPONSE_STATUS.OK) {
      setToken(authResult.data.token, authResult.data.userInfo);
      var popup = chrome.extension.getViews({
        type: "popup"
      })[0];
      popup.init();
    } else {
      alert(authResult.data.errorMsg);
    }
  }
}


/**
 * Event Listner
 */
chrome.commands.onCommand.addListener(function (command) {
  if (command === 'dialog') {
    getTextSelection(function (text) {
      chrome.tabs.executeScript(null, {
        code: 'var textSelection = "' + text.replace(/(\r\n|\n|\r)/gm, ' ').replace(/"/gm, "\"").replace(/"/gm, "\"") + '";'
      }, function () {
        chrome.tabs.executeScript(null, {
          file: "dialog.js"
        });
      });
    }, function () {
      alert('empty text selection!');
    });
  };
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.msg === "auth") {
      controller.auth(request, sender, sendResponse);
    } else if (request.msg === 'create_post') {
      // as contrller.node.post will sendResposne, need to return true to content scripts
      return controller.node.post(request, sender, sendResponse);
    };
  }
);

/**
 * Private function
 */

function getTextSelection(OKCallback, failCallback) {
  chrome.tabs.executeScript({
    code: 'window.getSelection().toString();'
  }, function (result) {
    if (result[0]) {
      OKCallback(result[0])
    } else {
      failCallback();
    }
  });
}

function postNode(token, title, description, callback) {
  let postBody = {
    title,
    description
  };

  chrome.storage.sync.get(['selectedNode'], function(storage){
    if(storage.selectedNode){
      postBody['relatedNodeId'] = storage.selectedNode.id;
    }
    let fetchOption = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(postBody)
    };
    _fectch(API.ENDPOINT + API.CONTROLLER.NODES, fetchOption)
      .then(function (response) {
        if (response.status === 200) {
          response.json().then(function(data){
            callback({
              status: RESPONSE_STATUS.OK,
              data
            });
          });
        } else {
          callback({
            status: RESPONSE_STATUS.FAILED,
            data: {
              errorMsg: 'create post failed'
            }
          });
        }
      });
  })


}

async function authAsync() {
  return new Promise(function (resolve, reject) {
    chrome.identity.getAuthToken({
      'interactive': true
    }, async function (code) {
      // check token is validated
      let fetchOption = {
        method: 'POST',
        body: JSON.stringify({code:code})
      };
      const response = await _fectch(API.ENDPOINT + API.CONTROLLER.AUTH, fetchOption);
      let userInfo = await response.json();

      const token = userInfo.token;
      delete userInfo.token;
      
      if (response.status === 200) {
        resolve({
          status: RESPONSE_STATUS.OK,
          data: {
            token: token,
            userInfo: userInfo
          }
        });
      } else {
        reject({
          status: RESPONSE_STATUS.FAILED,
          data: {
            errorMsg: 'auth fail'
          }
        });
      }
    });
  });
}

function setToken(token, userInfo) {
  chrome.storage.sync.set({
    token: token,
    userInfo: userInfo
  });
}

function _fectch(url, option, withCatch) {
  if (option.cache) {
    console.warn('Cound not declate cache in option params');
  }
  const newOption = {
    ...option,
    headers: {
      ...option.headers,
      'Content-Type': 'application/json'
    }
  }
  if (!withCatch) {
    newOption['cache'] = 'no-cache';
  } else {
    newOption['cache'] = 'cache';
  }
  return fetch(url, newOption);
}

function appendNodeHistory(node, callback) {
  chrome.storage.sync.get(['history'], function (data) {
    let history = data.history
    if (!history || !Array.isArray(history)) {
      history = [];
    }
    history.unshift(node);
    history.splice(NODE_HISTORY_LIMIT);
    chrome.storage.sync.set({
      history
    }, function () {
      if (callback && typeof callback === 'function') {
        callback();
      }
    })
  })
}

/**
 * Not Support
 * When Chrome exension support async sendResponse 
 */
async function getStorageAsync(key) {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get([key], function (data) {
      if (data) {
        resolve(data[key]);
      } else {
        reject(data[key]);
      }
    });
  });
}

async function appendHistoryAsync(data) {
  return new Promise(async function (resolve, reject) {
    let history = await getStorageAsync('history');
    if (!history || !Array.isArray(history)) {
      history = [];
    }
    history.push(data);
    chrome.storage.sync.set({
      history
    }, function () {
      resolve({
        status: RESPONSE_STATUS.OK,
        data: {
          history
        }
      });
    });
  });
}