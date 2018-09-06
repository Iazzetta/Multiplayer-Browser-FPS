import * as THREE from "three";
import SocketIO from "socket.io-client";
import { Game as BaseGame } from "../game/game.js";
import {
    setScreenSize,
    setPlayerInput,
    setPlayerAim,
    Action
} from "../game/actions.js";
import clamp from "lodash/clamp";

export class Game extends BaseGame {
    constructor() {
        super();

        /**
         * @type {SocketIOClient.Socket}
         */
        this.socket = null;

        /**
         * @type {THREE.WebGLRenderer}
         */
        this.renderer = null;

        this.initSocket();
        this.initRenderer();
        this.initMouseInput();
        this.initKeyboardInput();

        this.subscriptions.push(action => {
            switch (action.type) {
                case "INIT_GAME": {
                    const playerId = this.playerId();
                    const player = this.state.entities.get(playerId);
                    if (player !== undefined) {
                        player.mesh.head.add(this.state.camera);
                        player.mesh.body.visible = false;
                    }
                    this.resize();
                    break;
                }
            }
        });
    }

    playerId() {
        return this.socket ? this.socket.id : "single-player";
    }

    /**
     * @param {Action} action
     */
    syncDispatch(action) {
        this.dispatch(action);
        this.socket.emit("dispatch", action);
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
        this.resize();

        document.body.innerHTML = "";
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener("resize", this.resize.bind(this));
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
                const player = this.state.entities.get(playerId);
                if (player !== undefined) {
                    let ver = player.mesh.body.rotation.y - ev.movementX * 0.01;
                    let hor = player.mesh.head.rotation.x - ev.movementY * 0.01;
                    hor = clamp(hor, -1, 1);
                    this.syncDispatch(setPlayerAim(playerId, ver, hor));
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
                this.syncDispatch(action);
            }
        };

        document.addEventListener("keydown", ev => input(ev.keyCode, true));
        document.addEventListener("keyup", ev => input(ev.keyCode, false));
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setSize(width, height);
        this.dispatch(setScreenSize(width, height));
    }

    render() {
        this.renderer.render(this.state.scene, this.state.camera);
    }
}
