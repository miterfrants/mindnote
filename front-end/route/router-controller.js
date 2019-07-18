window['MindnoteStylesheet'] = [];
export class RouterController {
    constructor(elHTML, parentController, args, context) {
        this.elHTML = elHTML;
        this.args = args;
        this.context = context;
        this.elOriginalChildNodes = [];
        this.parentController = parentController;
        if (elHTML !== null) {
            if (this.elHTML.querySelector('.child-router')) {
                this.elHTML.querySelector('.child-router').style.display = 'none';
            }
            saveOriginalChildRouter(this);
            setupHTML(this);
        }
    }
    enter(args) {
        this.args = args;
        if (this.elHTML !== null) {
            if (this.elHTML.querySelector('.child-router')) {
                this.elHTML.querySelector('.child-router').style.display = 'none';
            }
            revertOriginalChildRouter(this);
            setupHTML(this);
        }
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
        if (window.MindnoteStylesheet.indexOf(stylesheets[i].href) === -1) {
            controllerInstance.elHTML.removeChild(stylesheets[i]);
            document.head.appendChild(stylesheets[i]);
            window.MindnoteStylesheet.push(stylesheets[i].href);
        }
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