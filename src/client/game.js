import * as THREE from "three";
import SocketIO from "socket.io-client";
import { Game as BaseGame } from "../game/game.js";
import {
    initGame,
    setScreenSize,
    setPlayerInput,
    setPlayerAim,
    Action
} from "../game/actions.js";
import clamp from "lodash/clamp";

class Game extends BaseGame {
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

        /**
         * @type {HTMLCanvasElement}
         */
        this.hud = null;

        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = null;

        this.subscriptions.push(action => {
            switch (action.type) {
                case "INIT_GAME": {
                    this.mountPlayerCamera();
                    break;
                }
            }
        });

        this.initSocket();
        this.initRenderer();
        this.initMouseInput();
        this.initKeyboardInput();
    }

    run() {
        const game = new Game();
        game.state.assets.loadImg("gun_sprite", "/assets/gun_sprite.png");
        game.state.assets.loadObj("wall_tile", "/assets/wall_tile.obj");
        game.state.assets.loadObj("player_head", "/assets/player_head.obj");
        game.state.assets.loadObj("player_body", "/assets/player_body.obj");
        game.state.assets.loadObj("bullet_pickup", "/assets/bullet_pickup.obj");
        game.state.assets.loadObj(
            "jetpack_pickup",
            "/assets/jetpack_pickup.obj"
        );

        game.state.assets.done().then(() => {
            game.dispatch(initGame([game.playerId(), "dummy-player"]));
            requestAnimationFrame(function next() {
                game.update();
                game.render();
                requestAnimationFrame(next);
            });
        });
    }

    playerId() {
        return this.socket.id || "single-player";
    }

    mountPlayerCamera() {
        const playerId = this.playerId();
        const player = this.state.entities.get(playerId);
        if (player !== undefined) {
            player.head.add(this.state.camera);
            player.object3D.visible = false;
        }
        this.resize();
    }

    /**
     * @param {Action} action
     */
    syncDispatch(action) {
        this.dispatch(action);
        this.socket.emit("dispatch", action);
    }

    initSocket() {
        this.socket = SocketIO("http://localhost:8080", {
            reconnection: false
        });

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
        this.hud = document.createElement("canvas");
        this.ctx = document.createElement("canvas").getContext("2d");
        this.hud.classList.add("hud");

        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        // Append to dom
        document.body.innerHTML = "";
        document.body.appendChild(this.hud);
        document.body.appendChild(this.renderer.domElement);

        // Resize - full screen
        this.resize();
        window.addEventListener("resize", this.resize.bind(this));
    }

    initMouseInput() {
        const canvas = this.renderer.domElement;

        // @ts-ignore
        canvas.addEventListener("click", ev => {
            if (document.pointerLockElement !== canvas) {
                canvas.requestPointerLock();
            }
        });

        canvas.addEventListener("mousemove", ev => {
            if (document.pointerLockElement === canvas) {
                const playerId = this.playerId();
                const { object3D, head } = this.state.getEntity(playerId);
                if (object3D && head) {
                    let ver = object3D.rotation.y - ev.movementX * 0.01;
                    let hor = head.rotation.x - ev.movementY * 0.01;
                    hor = clamp(hor, -1.6, 1.6);
                    this.syncDispatch(setPlayerAim(playerId, ver, hor));
                }
            }
        });

        // @ts-ignore
        canvas.addEventListener("mousedown", ev => {
            if (document.pointerLockElement === canvas) {
                const playerId = this.playerId();
                const action = setPlayerInput(playerId, "shoot", true);
                this.syncDispatch(action);
            }
        });

        // @ts-ignore
        canvas.addEventListener("mouseup", ev => {
            if (document.pointerLockElement === canvas) {
                const playerId = this.playerId();
                const action = setPlayerInput(playerId, "shoot", false);
                this.syncDispatch(action);
            }
        });
    }

    initKeyboardInput() {
        const [W, A, S, D, SPACE] = [87, 65, 83, 68, 32];
        const keyBinds = {
            [W]: "forward",
            [A]: "left",
            [S]: "back",
            [D]: "right",
            [SPACE]: "jump"
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

        Object.assign(this.hud, { width, height });
        Object.assign(this.ctx.canvas, { width, height });
        this.ctx.imageSmoothingEnabled = false;
        this.renderer.setSize(width, height);
        this.dispatch(setScreenSize(width, height));
    }

    render() {
        // World
        this.renderer.render(this.state.scene, this.state.camera);
        this.renderHUD();
    }

    renderHUD() {
        this.ctx.clearRect(0, 0, this.hud.width, this.hud.height);

        const { ammo, weapon, jetpack } = this.state.getEntity(this.playerId());

        // Gun
        if (ammo && weapon) {
            this.ctx.drawImage(
                this.state.assets.sprite("gun_sprite"),
                this.hud.width * 0.5,
                this.hud.height * 0.5,
                384,
                384
            );

            this.ctx.fillStyle =
                weapon.ammoCount > 0 ? "cornflowerblue" : "red";
            this.ctx.font = "30px Arial";
            this.ctx.fillText(
                [weapon.ammoCount, ammo.bulletCount].join("/"),
                this.hud.width * 0.5 + 150,
                this.hud.height - 50
            );
        }

        // Fuel
        if (jetpack) {
            const pad = 16;
            const barHeight = 8;
            const barWidth = 800;

            const empty = Math.abs(jetpack.minFuel);
            const fuel = empty + jetpack.fuel;
            const full = empty + jetpack.maxFuel;

            this.ctx.fillStyle = "black";
            this.ctx.fillRect(pad, pad, barWidth, barHeight);

            const fuelWidth = barWidth * (fuel / full);
            this.ctx.fillStyle = jetpack.fuel > 0 ? "cornflowerblue" : "red";
            this.ctx.fillRect(pad, pad, fuelWidth, barHeight);

            const emptyFuel = barWidth * (empty / full);
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(pad + emptyFuel, pad - 2, 2, barHeight + 4);
        }

        // Cursor
        const cursor = { x: this.hud.width * 0.5, y: this.hud.height * 0.5 };
        const radius = 32;

        this.ctx.lineWidth = 2;

        this.ctx.strokeStyle = "#fff";
        this.ctx.beginPath();
        this.ctx.arc(cursor.x, cursor.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(cursor.x, cursor.y, 1, 0, Math.PI * 2);
        this.ctx.stroke();

        // Blit
        const ctx = this.hud.getContext("2d");
        ctx.clearRect(0, 0, this.hud.width, this.hud.height);
        ctx.drawImage(this.ctx.canvas, 0, 0);
    }
}

new Game().run();
