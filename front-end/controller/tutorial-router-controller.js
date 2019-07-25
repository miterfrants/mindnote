import {
    RouterController
} from '/mindnote/route/router-controller.js';

import {
    Swissknife
} from '/mindnote/service/swissknife.js';

import {
    Loader
} from '/mindnote/util/loader.js';

export class TutorialRouterController extends RouterController {
    constructor(elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
        this.isTutorialMode = Swissknife.Tutorial.isTutorialMode();
    }
    async enter(args) {
        super.enter(args);
    }
    async exit(args) {
        super.exit(args);
        Swissknife.Tutorial.endTour();
    }

    async showTutorial(stepsClass, useModalOverlay) {
        if (!this.isTutorialMode) {
            return;
        }
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