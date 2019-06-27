import {
    UI
} from '/mindmap/ui.js';
export const Auth = (controller, args, context) => {
    const init = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            UI.hideAuth();
        } else {
            args['token'] = token;
            controller(args);
        }
    }
    init();
}