/**
 * Constant
 */
const API = {
  ENDPOINT: 'https://dev.sapiens.tools:8082/mindmap/api/v1/',
  CONTROLLER: {
    USER: 'users/',
    BOARDS: 'users/{username}/boards/',
    BOARD: 'users/{username}/boards/{uniquename}/',
    NODE: 'users/{username}/boards/{boardUniquename}/nodes/',
    AUTH: 'auth/'
  }
};

const RESPONSE_STATUS = {
  OK: 'OK',
  FAILED: 'FAILED',
};

const ERROR = {
  AUTH: {

  }
};

const NODE_HISTORY_LIMIT = 5;

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
  }
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  chrome.storage.sync.get(['token', 'userInfo', 'selectedBoard', 'selectedNode'], function (storage) {
    let data = {
      username: storage.userInfo ? storage.userInfo.username : null,
      token: storage.token || null,
      selectedBoard: storage.selectedBoard ? storage.selectedBoard : null,
      selectedNode: storage.selectedNode ? storage.selectedNode : null
    }
    if (req.action) {
      controller[req.controller][req.action]({
        ...req.data,
        ...data
      }, sendResponse);
    } else {
      controller[req.controller](data, sendResponse);
    }
  });
  return true;
});

/**
 * Controller
 */
const controller = {
  board: {
    get: async (data, sendResponse) => {
      let api = API.ENDPOINT + API.CONTROLLER.BOARDS;
      api = api.bind(data);
      let fetchOption = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + data.token
        }
      };
      const resp = await _fetch(api, fetchOption);

      if (resp.status === 200) {
        const boards = await resp.json();
        sendResponse({
          status: RESPONSE_STATUS.OK,
          data: {
            boards,
          }
        });
      } else {
        sendResponse({
          status: RESPONSE_STATUS.FAILED,
          data: {
            errorMsg: 'get board failed:' + JSON.stringify(resp)
          }
        });
      }
    },
    post: async(data, sendResponse) => {
      let api = API.ENDPOINT + API.CONTROLLER.BOARDS;
      api = api.bind(data);
      const postBody = {
        title: data.title,
        uniquename: data.uniquename
      }
      const fetchOption = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + data.token
        },
        body: JSON.stringify(postBody)
      };
      const resp = await _fetch(api, fetchOption);
      if (resp.status === 200) {
        const board = await resp.json();
        sendResponse({
          status: RESPONSE_STATUS.OK,
          data: {
            ...board,
          }
        });
      } else {
        sendResponse({
          status: RESPONSE_STATUS.FAILED,
          data: {
            errorMsg: 'get board failed:' + JSON.stringify(resp)
          }
        });
      }
    },
    delete: async(data, sendResponse) => {
      let api = API.ENDPOINT + API.CONTROLLER.BOARD;
      api = api.bind(data);
      const fetchOption = {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + data.token
        }
      };
      const resp = await _fetch(api, fetchOption);
      if (resp.status === 200) {
        sendResponse({
          status: RESPONSE_STATUS.OK
        });
      } else {
        sendResponse({
          status: RESPONSE_STATUS.FAILED,
          data: {
            errorMsg: 'delete board failed:' + JSON.stringify(resp)
          }
        });
      }
    }
  },
  node: {
    post: async (data, sendResponse) => {
      // validation 
      if (!data.selectedBoard) {
        alert('Please select a board');
      }

      let apiNode = API.ENDPOINT + API.CONTROLLER.NODE;
      apiNode = apiNode.bind(data).replace(/{boardUniquename}/gi, data.selectedBoard.uniquename);
      let postBody = {
        title: data.title,
        description: data.description
      };

      if (data.selectedNode) {
        postBody['parent_node_id'] = data.selectedNode.id
      }

      let fetchOption = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + data.token
        },
        body: JSON.stringify(postBody)
      };
      const resp = await _fetch(apiNode, fetchOption)

      if (resp.status === 200) {
        const data = await resp.json();
        appendNodeHistory(data);
        sendResponse({
          status: RESPONSE_STATUS.OK,
          data
        });
      } else {
        sendResponse({
          status: RESPONSE_STATUS.FAILED,
          data: {
            errorMsg: 'create post failed'
          }
        });
      }
    }
  },
  auth: async (data, sendResponse) => {
    const resp = await authAsync();
    setToken(resp.data.token, resp.data.userInfo);
    sendResponse(resp);
  }
}

/**
 * Private function
 */
getTextSelection = (OKCallback, failCallback) => {
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

String.prototype.bind = function (variable) {
  var result = this.toString();
  for (var key in variable) {
    var reg = new RegExp('{' + key + '}', 'gi');
    result = result.replace(reg, variable[key]);
  }
  return result;
}

authAsync = async () => {
  return new Promise(function (resolve, reject) {
    chrome.identity.getAuthToken({
      'interactive': true
    }, async (code) => {
      // check token is validated
      const fetchOption = {
        method: 'POST',
        body: JSON.stringify({
          code: code
        })
      };
      const resp = await _fetch(API.ENDPOINT + API.CONTROLLER.AUTH, fetchOption)

      if (resp.status === 200) {
        const userInfo = await resp.json();
        const token = userInfo.token;
        delete userInfo.token;
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

function _fetch(url, option, withCatch) {
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
    });
  })
}