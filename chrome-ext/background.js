let RESPONSE_STATUS, API, NODE_HISTORY_LIMIT, CLIPBOARD_LIMIT, controller;
(async () => {
  (await import(chrome.extension.getURL('/util/extended-prototype.js'))).extendStringProtoType();
  const constantModule = (await import(chrome.extension.getURL('/constant.js')))
  RESPONSE_STATUS = constantModule.RESPONSE_STATUS;
  API = constantModule.API;
  NODE_HISTORY_LIMIT = constantModule.NODE_HISTORY_LIMIT;
  CLIPBOARD_LIMIT = constantModule.CLIPBOARD_LIMIT;
  controller = (await import(chrome.extension.getURL('/controller.js'))).controller;
})();

let tabId;

/**
 * Event Listner
 */
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
      controller.clipboard.unshift({
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
 * Private function
 */
openPopup = () => {
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

getTextSelection = (OKCallback, failCallback) => {
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