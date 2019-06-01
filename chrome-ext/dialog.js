document['chrome-ext-padlet-quickly-collect'] = {
    CHROME_EXTENSION_CLASS_PREFIX: 'chrome-ext-padlet-quickly-collect',
    CLASSNAME: {
        CONTAINER: 'container',
        DIALOG: 'dialog',
        DIALOG_CONTAINER: 'dialog-bg',
        TITLE: 'title',
        DESCRIPTION: 'description',
        CLOSE_BUTTON: 'close-button',
        CREATE_BUTTON: 'create-button',
    },
    run: function (textSelection) {
        // build a dialog and show 
        window.getSelection().empty();
        var dialogClass = this.CHROME_EXTENSION_CLASS_PREFIX + '-' + this.CLASSNAME.DIALOG;
        if (!document.querySelector('.' + dialogClass)) {
            var self = this;
            fetch(chrome.extension.getURL("dialog.html"))
                .then(function (response) {
                    return response.text();
                })
                .then(function (body) {
                    var div = document.createElement('div');
                    div.innerHTML = body.trim();
                    document.body.appendChild(div.firstChild);
                    self.initialize(textSelection);

                });
        }
    },
    initialize: function (textSelection) {
        var self = this;
        // binding close button handler
        document.querySelector('.' + this.CHROME_EXTENSION_CLASS_PREFIX + '-' + this.CLASSNAME.CLOSE_BUTTON).addEventListener('click', function () {
            self.removeDialog();
        });

        // fill text to input
        var titleInput = document.querySelector('.' + this.CHROME_EXTENSION_CLASS_PREFIX + '-' + this.CLASSNAME.TITLE + ' input');
        titleInput.value = textSelection;
        titleInput.focus();
        document.querySelector('.' + this.CHROME_EXTENSION_CLASS_PREFIX + '-' + this.CLASSNAME.DESCRIPTION + ' textarea').innerHTML = textSelection;

        // binding create button handler
        document.querySelector('.' + this.CHROME_EXTENSION_CLASS_PREFIX + '-' + this.CLASSNAME.CREATE_BUTTON).addEventListener('click', function () {
            self.createPost();
        });

        document.querySelector('.' + this.CHROME_EXTENSION_CLASS_PREFIX + '-' + this.CLASSNAME.CONTAINER).addEventListener('keydown', function (event) {
            if (event.keyCode === 27) {
                self.removeDialog();
            }
        })
    },
    createPost: function () {
        var title = document.querySelector('.' + this.CHROME_EXTENSION_CLASS_PREFIX + '-' + this.CLASSNAME.TITLE + ' input').value,
            description = document.querySelector('.' + this.CHROME_EXTENSION_CLASS_PREFIX + '-' + this.CLASSNAME.DESCRIPTION + ' textarea').value;
        var self = this;
        chrome.runtime.sendMessage({
            msg: 'create_post',
            title: title,
            description: description
        }, function (response) {
            if (response === 'OK') {
                self.removeDialog();
            } else {
                alert('Request failed.');
            }
        });

    },
    sendMessageAsync: function (option) {
        return new Promise(function (resolve, reject) {
            chrome.tabs.sendMessage(option, response => {
                if(response === 'OK') {
                    resolve({
                        status: 'OK'
                    });
                } else {
                    reject({
                        status: 'FAILED'
                    });
                }
            });
        })
    },
    removeDialog: function () {
        var dialogContainer = this.CHROME_EXTENSION_CLASS_PREFIX + '-' + this.CLASSNAME.CONTAINER
        var elements = document.querySelectorAll('.' + dialogContainer);
        for (var i = 0; i < elements.length; i++) {
            document.body.removeChild(elements[i]);
        }
    }
}
document['chrome-ext-padlet-quickly-collect'].run(textSelection);