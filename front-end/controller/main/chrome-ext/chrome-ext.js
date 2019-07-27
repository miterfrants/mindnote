import {
    RouterController
} from '/mindnote/route/router-controller.js';
export class chromeExt extends RouterController {
    constructor(elHTML, parentController, args, context) {
        super(elHTML, parentController, args, context);
    }
    async enter(args) {
        super.enter(args);
    }
    async exit(args) {
        super.exit(args);
    }
}