import {
    Swissknife
} from '/mindnote/service/swissknife.js';

export class RouterController {
    constructor(elHTML, parentController, args, context) {
        this.elHTML = elHTML;
        this.args = args;
        this.context = context;
        this.elOriginalChildNodes = [];
        this.parentController = parentController;

        if (elHTML) {
            const classQuery = elHTML.className.split(' ').map((className) => {
                return `.${className}`;
            }).join('');

            if (document.querySelector(classQuery)) {
                this.elHTML = document.querySelector(classQuery);
            }

            saveOriginalChildRouter(this);
        }
    }

    async enter(args) {
        this.args = args;
    }

    async render() {
        if (this.elHTML) {
            if (this.elHTML.querySelector('.child-router')) {
                this.elHTML.querySelector('.child-router').style.visibility = 'hidden';
            }
            revertOriginalChildRouter(this);
            if (this.context.isUpdateDOM) {
                updateDOM(this);
            }
        }
    }

    async exit() {}
}

function saveOriginalChildRouter(controllerInstance) {
    // handle stylesheets avoid duplicate load css file
    const stylesheets = [];
    controllerInstance.elHTML.childNodes.forEach((el) => {
        if (el.rel === 'stylesheet') {
            stylesheets.push(el);
        }
    });

    for (let i = 0; i < stylesheets.length; i++) {
        controllerInstance.elHTML.removeChild(stylesheets[i]);
        Swissknife.appendStylesheetToHead(stylesheets[i]);
    }

    // save original elHTML childNodes
    const elChildRouter = controllerInstance.elHTML.querySelector('.child-router');
    if (elChildRouter) {
        elChildRouter.childNodes.forEach((childNode) => {
            controllerInstance.elOriginalChildNodes.push(childNode);
        });
    }
}

function revertOriginalChildRouter(controllerInstance) {
    const elChildRouter = controllerInstance.elHTML.querySelector('.child-router');
    if (elChildRouter) {
        elChildRouter.innerHTML = '';
        for (let i = 0; i < controllerInstance.elOriginalChildNodes.length; i++) {
            elChildRouter.appendChild(controllerInstance.elOriginalChildNodes[i]);
        }
    }
}

function updateDOM(controllerInstance) {
    let container = null;
    let parentController = controllerInstance.parentController;
    if (!parentController) {
        container = document.querySelector('.root');
    } else {
        container = recrusiveFindConcreteParent(parentController).elHTML.querySelector('.child-router');
    }

    if (container) {
        container.innerHTML = '';
        container.appendChild(controllerInstance.elHTML);
    }
}

function recrusiveFindConcreteParent(parentController) {
    if (parentController.elHTML !== null) {
        return parentController;
    } else if (parentController.parentController) {
        return recrusiveFindConcreteParent(parentController.parentController);
    } else {
        // refactor: throw mindnote error
    }
}