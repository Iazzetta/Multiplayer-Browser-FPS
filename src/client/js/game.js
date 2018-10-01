import * as THREE from "three";
import SocketIO from "socket.io-client";
import Stats from "stats.js";
import { PORT } from "../../game/consts.js";
import { Game as BaseGame } from "../../game/game.js";
import {
    Action,
    loadLevel,
    playerJoin,
    setAspectRatio,
    setPlayerMouse,
    setPlayerInput
} from "../../game/actions.js";
import { toRadians } from "../../game/utils.js";
import debounce from "lodash/debounce";
import clamp from "lodash/clamp";

export const [W, A, S, D, R, SPACE] = [87, 65, 83, 68, 82, 32];
export const KEY_BINDS = {
    [W]: "forward",
    [A]: "left",
    [S]: "back",
    [D]: "right",
    [R]: "reload",
    [SPACE]: "jump"
};

export class Game extends BaseGame {
    constructor() {
        super();

        /**
         * @type {HTMLElement}
         */
        this.container = document.body;

        /**
         * @type {boolean}
         */
        this.running = false;

        /**
         * @type {number}
         */
        this.bloodScreen = 0;

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
    }

    run() {
        const game = this;

        game.subscriptions.push(action => {
            switch (action.type) {
            }
        });

        // Init systems
        game.initRenderer();
        game.initMouseInput();
        game.initKeyboardInput();

        // Init game world
        const level = game.state.assets.level("level-1");
        game.dispatch(loadLevel(level));
        game.dispatch(playerJoin(this.playerId, "Player 1"));
        game.initSocket();

        // Run game
        game.running = true;
        requestAnimationFrame(function next() {
            game.stats.begin();
            game.update();
            game.render();
            game.stats.end();
            if (game.running) {
                requestAnimationFrame(next);
            }
        });
    }

    get playerId() {
        return this.state.playerId;
    }

    myComponents() {
        return this.state.getEntityComponents(this.playerId);
    }

    /**
     * @param {KeyboardEvent} ev
     */
    onKeyDown(ev) {
        const id = this.playerId;
        const input = KEY_BINDS[ev.keyCode];
        if (input !== undefined) {
            this.dispatch(setPlayerInput(id, input, true));
        }
    }

    /**
     * @param {KeyboardEvent} ev
     */
    onKeyUp(ev) {
        const id = this.playerId;
        const input = KEY_BINDS[ev.keyCode];
        if (input !== undefined) {
            this.dispatch(setPlayerInput(id, input, false));
        }
    }

    /**
     * @param {MouseEvent} ev
     */
    onMouseMove(ev) {
        const id = this.playerId;
        const speed = 0.005;
        const ver = -ev.movementX * speed;
        const hor = -ev.movementY * speed;
        this.dispatch(setPlayerMouse(id, ver, hor));
    }

    /**
     * @param {MouseEvent} ev
     */
    onMouseDown(ev) {
        const id = this.playerId;
        const input = "shoot";
        this.dispatch(setPlayerInput(id, input, true));
    }

    /**
     * @param {MouseEvent} ev
     */
    onMouseUp(ev) {
        const id = this.playerId;
        const input = "shoot";
        this.dispatch(setPlayerInput(id, input, false));
    }

    destroy() {
        this.running = false;
        this.container.innerHTML = "";
    }

    loadAssets() {
        this.state.assets.loadLevel("level-1", "levels/level.json");
        this.state.assets.loadObj("bullet", "bullet.obj");
        this.state.assets.loadObj("wall_tile", "wall_tile.obj");
        this.state.assets.loadObj("player_head", "player_head.obj");
        this.state.assets.loadObj("player_body", "player_body.obj");
        this.state.assets.loadObj("player_weapon", "player_weapon.obj");
        this.state.assets.loadObj("bullet_pickup", "bullet_pickup.obj");
        this.state.assets.loadObj("jetpack_pickup", "jetpack_pickup.obj");
        return this.state.assets.done();
    }

    initSocket() {
        const url = location.href.replace(location.port, PORT);
        this.socket = SocketIO(url, { reconnection: false });

        this.socket.on("connect", () => {
            console.log("Connected");

            const name = prompt("Pleas enter your name", "Player");
            this.socket.emit("join", { name });

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
        this.container.innerHTML = "";
        this.container.appendChild(this.hud);
        this.container.appendChild(this.stats.dom);
        this.container.appendChild(this.renderer.domElement);

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
                this.onMouseMove(ev);
            }
        });

        canvas.addEventListener("mousedown", ev => {
            if (document.pointerLockElement === canvas) {
                this.onMouseDown(ev);
            }
        });

        canvas.addEventListener("mouseup", ev => {
            if (document.pointerLockElement === canvas) {
                this.onMouseUp(ev);
            }
        });
    }

    initKeyboardInput() {
        const kesy = new Map();
        const input = keyEvent => ev => {
            if (kesy.get(ev.keyCode) !== ev.type) {
                kesy.set(input, ev.type);
                keyEvent.call(this, ev);
            }
        };

        document.addEventListener("keydown", input(this.onKeyDown));
        document.addEventListener("keyup", input(this.onKeyUp));
    }

    resize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        if (this.container !== document.body) {
            width = this.container.clientWidth;
            height = this.container.clientHeight;
        }

        Object.assign(this.hud, { width, height });
        Object.assign(this.ctx.canvas, { width, height });
        this.ctx.imageSmoothingEnabled = false;
        this.renderer.setSize(width, height);
        this.dispatch(setAspectRatio(width, height));
    }

    update() {
        super.update();

        // POV - Animations
        const { player, weapon, head } = this.myComponents();

        if (
            player !== undefined &&
            weapon !== undefined &&
            head !== undefined
        ) {
            const gunMesh = head.children[head.children.length - 1];
            gunMesh.position.x = 0.05;
            gunMesh.position.y = -0.25;
            gunMesh.position.z = -0.1;
            gunMesh.rotation.set(0, 0, 0);

            switch (player.state) {
                case "shooting": {
                    const s = weapon.firerateTimer;
                    gunMesh.position.z += 0.0005 * s;
                    gunMesh.position.x += Math.random() * 0.0001 * s;
                    gunMesh.position.y += Math.random() * 0.0001 * s;
                    gunMesh.position.z += Math.random() * 0.0001 * s;
                    break;
                }
                case "reloading": {
                    const elapsed = this.state.time.elapsed * 0.01;
                    gunMesh.position.y += Math.cos(elapsed * 2) * 0.03;
                    gunMesh.position.z -= 0.5;
                    gunMesh.rotation.x = toRadians(-69);
                    gunMesh.rotation.y = toRadians(50);
                    gunMesh.rotation.z = toRadians(25);
                    break;
                }
                case "running": {
                    const elapsed = this.state.time.elapsed * 0.01;
                    gunMesh.position.y += Math.cos(elapsed * 2) * 0.03;
                    gunMesh.position.x -= Math.cos(elapsed) * 0.03;
                    break;
                }
                default:
                case "idle": {
                    const elapsed = this.state.time.elapsed * 0.005;
                    gunMesh.position.y += Math.cos(elapsed * 2) * 0.0025;
                    gunMesh.position.x -= Math.cos(elapsed) * 0.0025;
                    break;
                }
            }
        }
    }

    render() {
        this.renderer.render(this.state.scene, this.state.camera);
        this.renderHUD();
    }

    renderHUD() {
        const { player, weapon, health } = this.myComponents();

        // Clear
        this.ctx.clearRect(0, 0, this.hud.width, this.hud.height);

        // Blood screen
        if (this.bloodScreen > 0) {
            this.bloodScreen -= this.state.time.delta;
            this.bloodScreen = Math.max(this.bloodScreen, 0);

            this.ctx.globalAlpha = this.bloodScreen / 2000;
            this.ctx.fillStyle = "red";
            this.ctx.fillRect(0, 0, this.hud.width, this.hud.height);
            this.ctx.globalAlpha = 1;
        }

        // Respawn
        if (player && player.respawnTimer > 0) {
            const sec = Math.ceil(player.respawnTimer / 1000);
            this.ctx.font = "32px Impact";
            this.ctx.fillStyle = "red";
            this.ctx.fillText(
                "Respawn in: " + sec,
                this.hud.width * 0.5 - 100,
                this.hud.height * 0.4
            );
        }

        // Weapon
        if (weapon) {
            this.renderInfo({
                text: "AMMO",
                info: weapon.reloadTimer > 0 ? "Reloading..." : null,
                color:
                    weapon.loadedAmmo + weapon.reservedAmmo > 0
                        ? "yellow"
                        : "red",
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

        if (!this.socket.connected) {
            this.ctx.fillStyle = "gray";
            this.ctx.fillText("offline", 16, 80);
        } else {
            this.ctx.fillStyle = "limegreen";
            this.ctx.fillText("online", 16, 80);

            // Players
            this.ctx.font = "26px Impact";
            this.state.getEntityGroup("player").forEach((player, index) => {
                if (player.player) {
                    const { name, kills, deaths } = player.player;
                    const { health } = player;

                    // SCORE
                    const score = kills.toString() + " | " + deaths.toString();
                    this.ctx.fillStyle = "black";
                    this.ctx.fillText(score, 16, 130 + 32 * index);
                    this.ctx.fillStyle = "white";
                    this.ctx.fillText(score, 16, 128 + 32 * index);

                    // Name
                    this.ctx.fillStyle = "black";
                    this.ctx.fillText(name, 80, 130 + 32 * index);
                    this.ctx.fillStyle = health ? "white" : "red";
                    this.ctx.fillText(name, 80, 128 + 32 * index);
                }
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
