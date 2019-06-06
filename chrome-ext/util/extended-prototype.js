const extendStringProtoType = () => {
    if (!String.prototype.bind) {
        String.prototype.bind = function (variable) {
            var result = this.toString();
            for (var key in variable) {
                var reg = new RegExp('{' + key + '}', 'gi');
                result = result.replace(reg, variable[key]);
            }
            return result;
        }
    }

    if (!String.prototype.toDom) {
        String.prototype.toDom = function () {
            let tempContainer = document.createElement('div');
            tempContainer.innerHTML = this.toString();
            return tempContainer.childNodes[0];
        }
    }
}


const extendHTMLElementProtoType = () => {
    if (!HTMLElement.prototype.collectFormData) {
        HTMLElement.prototype.collectFormData = function () {
            let inputs = this.querySelectorAll('input');
            const result = {};
            inputs.forEach((el) => {
                if (!el.dataset.field) {
                    console.warn('element data-field not exists');
                } else if (el.value) {
                    result[el.dataset.field] = el.value;
                }
            });
            return result;
        }
    }

    if (!HTMLElement.prototype.clearForm) {
        HTMLElement.prototype.clearForm = function () {
            let inputs = this.querySelectorAll('input');
            inputs.forEach((el) => {
                el.value = '';
            });
        }
    }

    if (!HTMLElement.prototype.classExists) {
        HTMLElement.prototype.classExists = function (className) {
            return this.className.indexOf(className) !== -1
        }
    }

    if (!HTMLElement.prototype.addClass) {
        HTMLElement.prototype.addClass = function (newClassName) {
            const classes = this.className.split(' ');
            if (classes.indexOf(newClassName) === -1) {
                classes.push(newClassName);
                this.className = classes.join(' ');
            }
        }
    }

    if (!HTMLElement.prototype.removeClass) {
        HTMLElement.prototype.removeClass = function (className) {
            const classes = this.className.split(' ');
            const index = classes.indexOf(className);
            if (index !== -1) {
                classes.splice(index, 1);
                this.className = classes.join(' ');
            }
        }
    }

    if (!HTMLElement.prototype.prepend) {
        HTMLElement.prototype.prepend = function (node) {
            this.insertBefore(node, this.childNodes[0]);
        }
    }
}

export {
    extendHTMLElementProtoType,
    extendStringProtoType
};