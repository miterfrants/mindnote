import {
    Swissknife
} from '/mindnote/service/swissknife.js';

import {
    Loader
} from '/mindnote/util/loader.js';

export class RouterController {
    constructor(elHTML, parentController, args, context) {
        this.elHTML = elHTML;
        this.args = args;
        this.context = context;
        this.elOriginalChildNodes = [];
        this.parentController = parentController;
        if (elHTML) {
            if (this.elHTML.querySelector('.child-router')) {
                this.elHTML.querySelector('.child-router').style.display = 'none';
            }
            saveOriginalChildRouter(this);
            setupHTML(this);
        }
    }
    async enter(args) {
        this.args = args;
        if (this.elHTML) {
            if (this.elHTML.querySelector('.child-router')) {
                this.elHTML.querySelector('.child-router').style.display = 'none';
            }
            revertOriginalChildRouter(this);
            setupHTML(this);
        }
    }
    async showTutorial(stepsClass, useModalOverlay) {
        const loader = new Loader();
        await loader.load([{
            url: '/mindnote/third-party/shepherd/shepherd.min.js',
            checkVariable: 'Shepherd'
        }]);
        const stylesheet = '<link rel="stylesheet" type="text/css" href="/mindnote/third-party/shepherd/shepherd-theme-default.css">'.toDom();
        Swissknife.appendStylesheetToHead(stylesheet);
        const tour = Swissknife.Tutorial.getTutorialSingleton(stepsClass, useModalOverlay);
        setTimeout(() => {
            if (location.search.indexOf('action=tutorial') !== -1) {
                tour.start();
            }
        }, 1000);
    }
}

function saveOriginalChildRouter(controllerInstance) {
    // handle stylesheets avoid duplicate load css file
    const stylesheets = [];
    controllerInstance.elHTML.childNodes.forEach((el) => {
        if (el.rel === 'stylesheet') {
            stylesheets.push(el);
        };
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

function setupHTML(controllerInstance) {
    let container = null;
    let parentController = controllerInstance.parentController;
    if (!parentController) {
        container = document.querySelector('.root');
    } else {
        container = recrusiveFindConcreteParent(parentController).elHTML.querySelector('.child-router')
    }

    if (container) {
        container.innerHTML = '';
        container.appendChild(controllerInstance.elHTML);
    }
}

function recrusiveFindConcreteParent(parentController) {
    if (parentController.elHTML !== null) {
        return parentController
    } else if (parentController.parentController) {
        return recrusiveFindConcreteParent(parentController.parentController);
    } else {
        // refactor: throw mindnote error
    }
}