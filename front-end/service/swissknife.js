window['MindnoteStylesheet'] = [];
window['MindnoteTutorial'] = null;
export const Swissknife = {
    Tutorial: {
        isTutorialMode: () => {
            const queryString = location.search.substring(1);
            const queryKeyValuePairs = queryString.split('&');
            for (let i = 0; i < queryKeyValuePairs.length; i++) {
                if (queryKeyValuePairs[i].indexOf('action=tutorial') !== -1) {
                    return true;
                }
            }
            return false;
        },
        getTutorialSingleton: (stepsClass, useModalOverlay) => {
            Shepherd.on('complete', (e) => {
                history.pushState({}, '', location.pathname);
            });
            Shepherd.on('cancel', (e) => {
                history.pushState({}, '', location.pathname);
            });
            if (!window.MindnoteTutorial) {
                window['MindnoteTutorial'] = new Shepherd.Tour({
                    defaultStepOptions: {
                        scrollTo: {
                            behavior: 'smooth',
                            block: 'center'
                        },
                    },
                    useModalOverlay: useModalOverlay
                });
            } else {
                window.MindnoteTutorial.steps = [];
                window.MindnoteTutorial.options.useModalOverlay = useModalOverlay;
            }
            const steps = new stepsClass(window.MindnoteTutorial);
            for (let i = 0; i < steps.length; i++) {
                window.MindnoteTutorial.addStep(steps[i].title, steps[i]);
            }
            return window.MindnoteTutorial;
        },
        gotoTutorialStep: (stepName) => {
            window.MindnoteTutorial.show(stepName);
        },
        getCurrentStep: () => {
            return window.MindnoteTutorial.currentStep;
        },
        endTour: () => {
            window.MindnoteTutorial.cancel();
        }
    },
    appendStylesheetToHead: (elStylesheet) => {
        if (window.MindnoteStylesheet.indexOf(elStylesheet.href) === -1) {
            document.head.appendChild(elStylesheet);
            window.MindnoteStylesheet.push(elStylesheet.href);
        }
    },
    getQueryString: (key) => {
        const queryStrings = location.search.substring(1).split('&')
        const result = queryStrings.find((qs) => {
            if (qs.indexOf(`${key}=`) === 0) {
                return true;
            } else {
                return false;
            }
        });
        if (result) {
            return decodeURIComponent(result.split('=')[1]);
        }
        return '';
    }
}