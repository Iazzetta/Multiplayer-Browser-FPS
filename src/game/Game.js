import * as THREE from "three";
import SocketIO from "socket.io-client";
import {
    Action,
    setScreenSize,
    setPlayerInput,
    setPlayerAim
} from "./actions.js";
import { State } from "./state.js";
import { dispatch } from "./dispatch.js";
import clamp from "lodash/clamp";

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
         * @type {SocketIOClient.Socket}
         */
        this.socket = null;

        /**
         * @type {THREE.WebGLRenderer}
         */
        this.renderer = null;

        /**
         * @type {Subscription[]}
         */
        this.subscriptions = [];
    }

    playerId() {
        return this.socket ? this.socket.id : "single-player";
    }

    initSocket() {
        this.socket = SocketIO("http://localhost:8080");
        this.socket.on("connect", () => {
            console.log("Connected");

            this.socket.on("dispatch", action => {
                this.dispatch(action);
            });

            this.socket.on("disconnect", () => {
                console.log("Disconnect");
            });
        });
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

    initMouseInput() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener("click", ev => {
            if (document.pointerLockElement !== canvas) {
                canvas.requestPointerLock();
            }
        });

        canvas.addEventListener("mousemove", ev => {
            if (document.pointerLockElement === canvas) {
                const playerId = this.playerId();
                const player = this.state.players.get(playerId);
                if (player !== undefined) {
                    let ver = player.mesh.rotation.y - ev.movementX * 0.01;
                    let hor = player.head.rotation.x + ev.movementY * 0.01;
                    hor = clamp(hor, -1.6, 1.6);
                    this.dispatch(setPlayerAim(playerId, ver, hor));
                }
            }
        });
    }

    initKeyboardInput() {
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
                const playerId = this.playerId();
                const action = setPlayerInput(playerId, input, value);
                this.dispatch(action);
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
            player.update();
        });
    }

    render() {
        this.renderer.render(this.state.scene, this.state.camera);
    }
}
