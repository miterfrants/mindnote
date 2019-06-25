import {
    User
} from '/mindmap/controller/user.js';
import {
    Board
} from '/mindmap/controller/board.js';
import {
    Auth
} from '/mindmap/controller/auth.js';
export const Route = {
    _dicReg: [],
    init: () => {
        if (Route._dicReg.length === 0) {
            for (let i = 0; i < Route.RoutingTable.length; i++) {
                const path = Route.RoutingTable[i].path
                const arrayOfPath = path.split('/')
                const arrayRegString = [];
                const arrayVars = [];
                for (let j = 0; j < arrayOfPath.length; j++) {
                    if (arrayOfPath[j].substring(0, 1) === '{') {
                        arrayVars.push(arrayOfPath[j].replace(/{/gi, '').replace(/}/gi, ''))
                        arrayRegString.push('([0-9|a-z|_|-]+)')
                    } else {
                        arrayRegString.push(arrayOfPath[j]);
                    }
                }
                Route._dicReg.push({
                    reg: '^' + arrayRegString.join('\\/') + '$',
                    router: Route.RoutingTable[i],
                    vars: arrayVars
                })
            }
        }
        Route.run();
    },
    run: () => {
        for (let i = 0; i < Route._dicReg.length; i++) {
            const target = Route._dicReg[i];
            const reg = new RegExp(target.reg);
            if (reg.test(location.pathname)) {
                const matches = location.pathname.match(reg);
                const args = {};
                for (let j = 0; j < target.vars.length; j++) {
                    args[target.vars[j]] = matches[j + 1];
                }
                if (target.router.isAuth) {
                    Auth(target.router.controller, args);
                } else {
                    target.router.controller(args);
                }
                return;
            }
        }
    },
    RoutingTable: [{
        path: '/mindmap/users/{username}/boards/{boardUniquename}/',
        isAuth: true,
        controller: User
    }, {
        path: '/mindmap/boards/{boardUniquename}/',
        controller: Board
    }]
}