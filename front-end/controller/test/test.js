import {
    RouterController
} from '/mindnote/route/router-controller.js';
export class Test extends RouterController {
    async enter(args, context) {
        super.enter(args, context);
        console.log('Test enter');
    }
}