import * as THREE from "three";
import {
    Action,
    setScreenSize,
    setPlayerInput,
    setPlayerAim
} from "./actions.js";
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
    initMouseInput(playerId) {
        const canvas = this.renderer.domElement;

        canvas.addEventListener("click", ev => {
            if (document.pointerLockElement !== canvas) {
                canvas.requestPointerLock();
            }
        });

        canvas.addEventListener("mousemove", ev => {
            if (document.pointerLockElement === canvas) {
                const player = this.state.players.get(playerId);
                if (player !== undefined) {
                    const ver = player.mesh.rotation.y + ev.movementX * 0.01;
                    this.dispatch(setPlayerAim(playerId, ver, 0));
                }
            }
        });
    }

    /**
     * @param {string} playerId
     */
    initKeyboardInput(playerId) {
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
                this.dispatch(setPlayerInput(playerId, input, value));
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

    /**
     * @param {number} elasped
     */
    update(elasped) {
        this.state.players.forEach(player => {
            player.update(elasped);
        });
    }

    render() {
        this.renderer.render(this.state.scene, this.state.camera);
    }
}
