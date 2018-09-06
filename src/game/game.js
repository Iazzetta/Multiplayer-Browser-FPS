import { Action } from "./actions.js";
import { State } from "./state.js";
import { dispatch } from "./dispatch.js";

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
    }

    /**
     * @param {Action} action
     */
    dispatch(action) {
        this.state = dispatch(this.state, action);
        for (let i = 0; i < this.subscriptions.length; i++) {
            this.subscriptions[i](action, this.state);
        }
    }

    /**
     * @param {number} elasped
     */
    update(elasped) {
        this.state.entities.forEach(player => {
            // player.update();
        });
    }
}
