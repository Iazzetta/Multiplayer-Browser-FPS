import * as THREE from "three";
import { Action, setScreenSize } from "./actions.js";
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

        const resize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.renderer.setSize(width, height);
            this.dispatch(setScreenSize(width, height));
        };

        document.body.innerHTML = "";
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener("resize", resize);
        resize();
    }

    /**
     * @param {string} playerId
     */
    initKeyboard(playerId) {
        const [W, A, S, D] = [87, 65, 83, 68];
        const keyBinds = {
            [W]: "forward",
            [A]: "left",
            [S]: "back",
            [D]: "right"
        };

        const kesy = new Map();
        const input = (keyCode, value) => {
            const input = keyBinds[keyCode];
            if (kesy.get(input) !== value && input !== undefined) {
                kesy.set(input, value);
                console.log("dispatch", { playerId, input, value });
            }
        };

        document.addEventListener("keydown", ev => input(ev.keyCode, true));
        document.addEventListener("keyup", ev => input(ev.keyCode, false));
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

    render() {
        this.renderer.render(this.state.scene, this.state.camera);
    }
}
