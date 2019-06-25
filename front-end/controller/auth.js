import {
    UI
} from '/mindmap/ui.js';
export const Auth = (controller, args) => {
    const token = localStorage.getItem('token');
    if (!token) {
        UI.hideAuth();
    } else {
        args['token'] = token;
        controller(args);
    }
}