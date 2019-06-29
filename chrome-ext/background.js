import {
  RESPONSE_STATUS,
  API,
  REMOTE_LIB_API_SERVICE,
  CLIPBOARD_LIMIT
} from '/config.js';

import {
  extendStringProtoType
} from '/util/extended-prototype.js';
extendStringProtoType();

import {
  extService
} from '/service/ext.js'
extService.init(CLIPBOARD_LIMIT, API, RESPONSE_STATUS);
window.extService = extService;

(async () => {
  const {
    api
  } = await import(REMOTE_LIB_API_SERVICE);
  api.init(API, RESPONSE_STATUS);
  window.authApiService = api.authApiService;
})();


/**
 * Event Listner
//  */
chrome.commands.onCommand.addListener(function (command) {
  if (command === 'dialog') {
    getTextSelection((text) => {
      chrome.storage.sync.set({
        textSelection: text
      }, () => {
        openPopup();
      });
    });
  } else if (command === 'unshift_to_clipboard') {
    getTextSelection((text) => {
      extService.clipboard.unshift({
        text
      });
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
    window[req.service][req.module][req.action]({
      ...req.data,
      ...data
    }, sendResponse);
  });
  return true;
});

// /**
//  * Private function
//  */
const openPopup = () => {
  const w = 600;
  const h = 800;
  const left = (screen.width / 2) - (w / 2);
  const top = (screen.height / 2) - (h / 2);
  getTextSelection((text) => {
    let url = chrome.runtime.getURL("popup/popup.html");
    url += '?action=create-node&text=' + encodeURIComponent(text);
    chrome.windows.create({
      type: 'popup',
      width: w,
      height: h,
      top,
      left,
      url
    });
  });
}

const getTextSelection = (OKCallback, failCallback) => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    var currTab = tabs[0];
    if (currTab.url.indexOf('chrome://') === -1) {
      chrome.tabs.executeScript({
        code: 'window.getSelection().toString();'
      }, function (result) {
        if (result !== null && result !== undefined && result.length > 0) {
          OKCallback(result[0]);
        } else {
          OKCallback();
        }
      });
    };
  });
}