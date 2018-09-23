import * as THREE from "three";
import SocketIO from "socket.io-client";
import Stats from "stats.js";
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
         * @type {Stats}
         */
        this.stats = new Stats();

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
        const game = this;
        game.loadAssets().then(() => {
            game.dispatch(initGame([game.playerId(), "dummy-player"]));
            requestAnimationFrame(function next() {
                game.stats.begin();
                game.update();
                game.render();
                requestAnimationFrame(next);
                game.stats.end();
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
            player.head.children.forEach(child => {
                child.visible = false;
            });

            const weapon = this.state.assets.mesh("player_weapon");
            weapon.scale.multiplyScalar(0.5);
            weapon.position.x = 0.25;
            weapon.position.y = -0.25;
            weapon.position.z = -0.1;
            player.head.add(weapon);
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

    loadAssets() {
        this.state.assets.loadImg("gun_sprite", "/assets/gun_sprite.png");
        this.state.assets.loadObj("wall_tile", "/assets/wall_tile.obj");
        this.state.assets.loadObj("player_head", "/assets/player_head.obj");
        this.state.assets.loadObj("player_body", "/assets/player_body.obj");
        this.state.assets.loadObj("player_weapon", "/assets/player_weapon.obj");
        this.state.assets.loadObj("bullet_pickup", "/assets/bullet_pickup.obj");
        this.state.assets.loadObj(
            "jetpack_pickup",
            "/assets/jetpack_pickup.obj"
        );
        return this.state.assets.done();
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
        // Native canvas HUD overlay
        this.hud = document.createElement("canvas");
        this.ctx = document.createElement("canvas").getContext("2d");
        this.hud.classList.add("hud");

        // Init THREE Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        // Append to dom
        document.body.innerHTML = "";
        document.body.appendChild(this.hud);
        document.body.appendChild(this.stats.dom);
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
        const [W, A, S, D, R, SPACE] = [87, 65, 83, 68, 82, 32];
        const keyBinds = {
            [W]: "forward",
            [A]: "left",
            [S]: "back",
            [D]: "right",
            [R]: "reload",
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
        this.renderer.render(this.state.scene, this.state.camera);
        this.renderHUD();
    }

    renderHUD() {
        const { weapon, jetpack, health } = this.state.getEntityComponents(
            this.playerId()
        );

        // Clear
        this.ctx.clearRect(0, 0, this.hud.width, this.hud.height);

        // Weapon
        if (weapon) {
            this.renderInfo({
                text: "AMMO",
                info: weapon.reloadTimer > 0 ? "Reloading..." : null,
                color: "yellow",
                value: weapon.loadedAmmo,
                max: weapon.reservedAmmo,
                x: this.hud.width * 0.75,
                y: this.hud.height - 50
            });
        }

        // Health
        if (health) {
            this.renderInfo({
                text: "HP",
                info: null,
                color: "limegreen",
                value: health.hp,
                max: health.max,
                x: this.hud.width * 0.5,
                y: this.hud.height - 50
            });
        }

        // Cursor
        const cursor = { x: this.hud.width * 0.5, y: this.hud.height * 0.5 };
        const radius = 16;

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

    /**
     * @param {object} config
     * @param {string} config.text
     * @param {string} config.info
     * @param {string} config.color
     * @param {number} config.value
     * @param {number} config.max
     * @param {number} config.x
     * @param {number} config.y
     */
    renderInfo(config) {
        const text = `${config.text}: ${config.value}/${config.max}`;
        this.ctx.font = "30px Impact";
        this.ctx.fillStyle = config.color;
        this.ctx.fillText(text, config.x, config.y);
        if (config.info) {
            this.ctx.font = "16px Impact";
            this.ctx.fillText(config.info, config.x, config.y + 24);
        }
    }
}

new Game().run();
