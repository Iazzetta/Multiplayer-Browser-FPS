import { Action } from "./actions.js";
import { State } from "./state.js";
import { dispatch } from "./dispatch.js";
import { update } from "./update.js";

/**
 * @typedef {(action:Action,state:State) => any} Subscription
 */
export class Game {
    constructor() {
        /**
         * @type {State}
         */
        this.state = new State();

        /**
         * @type {Subscription[]}
         */
        this.subscriptions = [];

        /**
         * @param {Action} action
         */
        this.dispatch = action => {
            this.state = dispatch(this.state, action);
            for (let i = 0; i < this.subscriptions.length; i++) {
                this.subscriptions[i](action, this.state);
            }
        };
    }

    update() {
        update(this.state, this.dispatch);
    }
}
