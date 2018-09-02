import * as THREE from "three";
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
         * @type {THREE.WebGLRenderer}
         */
        this.renderer = null;

        /**
         * @type {Subscription[]}
         */
        this.subscriptions = [];
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.subscribe(action => {
            if (action.type === "SET_SCREEN_SIZE") {
                const { width, height } = action.data;
                this.renderer.setSize(width, height);
            }
        });

        document.body.innerHTML = "";
        document.body.appendChild(this.renderer.domElement);
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
     * @param {Subscription} f
     */
    subscribe(f) {
        this.subscriptions.push(f);
    }

    render() {
        this.renderer.render(this.state.scene, this.state.camera);
    }
}
