if (!window['MindnoteStylesheet']) {
    window['MindnoteStylesheet'] = [];
}
window['MindnoteTutorial'] = null;
export const Swissknife = {
    Tutorial: {
        isTutorialMode: () => {
            const queryString = location.search ? location.search.substring(1) : '';
            const queryKeyValuePairs = queryString.split('&');
            for (let i = 0; i < queryKeyValuePairs.length; i++) {
                if (queryKeyValuePairs[i].indexOf('action=tutorial') !== -1) {
                    return true;
                }
            }
            return false;
        },
        // refactor: rename function name like setupTurtorialSingleton
        getTutorialSingleton: (stepsClass, useModalOverlay) => {
            if (!window.MindnoteTutorial) {
                window['MindnoteTutorial'] = new window.Shepherd.Tour({
                    defaultStepOptions: {
                        scrollTo: {
                            behavior: 'smooth',
                            block: 'center'
                        },
                    },
                    useModalOverlay: useModalOverlay
                });
                window.Shepherd.on('complete', () => {
                    history.pushState({}, '', location.pathname);
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
            if (window.MindnoteTutorial) {
                window.MindnoteTutorial.cancel();
            }
        }
    },
    appendStylesheetToHead: (elStylesheet) => {
        if (elStylesheet.href.indexOf('http') === -1) {
            elStylesheet.href = location.origin + elStylesheet.href;
        }
        if (window.MindnoteStylesheet.indexOf(elStylesheet.href) === -1) {
            document.head.appendChild(elStylesheet);
            window.MindnoteStylesheet.push(elStylesheet.href);
        }
    },
    getQueryString: (key) => {
        if (!location.search || location.search.substring(1).length === 0) {
            return '';
        }
        const queryStrings = location.search.substring(1).split('&');
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
    },
    copyText: (text) => {
        const tempElement = document.createElement('textarea');
        tempElement.value = text;
        tempElement.style.opacity = 0;
        tempElement.style.position = 'fixed';
        tempElement.style.top = 0;
        document.body.appendChild(tempElement);
        tempElement.select();
        document.execCommand('copy');
        document.body.removeChild(tempElement);
    }

};