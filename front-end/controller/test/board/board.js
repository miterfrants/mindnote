import {
    RouterController
} from '/mindnote/route/router-controller.js';

export class TestBoard extends RouterController {
    async enter(args, context) {
        super.enter(args, context);
        console.log('testboard run');
    }
}