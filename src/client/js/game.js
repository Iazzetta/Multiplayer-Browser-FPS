import * as THREE from "three";
import SocketIO from "socket.io-client";
import Stats from "stats.js";
import { PORT } from "../../game/consts.js";
import { Game as BaseGame } from "../../game/game.js";
import {
    SERVER_ACTION,
    CLIENT_ACTION,
    loadLevel,
    playerJoin,
    setAspectRatio,
    setPlayerMouse,
    setPlayerInput,
    setMyPlayerId,
    syncPlayer,
    HIT_PLAYER
} from "../../game/actions.js";
import debounce from "lodash/debounce";

export const [W, A, S, D, R, SPACE, SHIFT] = [87, 65, 83, 68, 82, 32, 16];
export const KEY_BINDS = {
    [W]: "forward",
    [A]: "left",
    [S]: "back",
    [D]: "right",
    [R]: "reload",
    [SPACE]: "jump",
    [SHIFT]: "down"
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

        this.syncMe = () => {
            this.socket.emit("dispatch", syncPlayer(this.playerId, this.state));
        };
        this.syncMeDebounce = debounce(this.syncMe, 500);
    }

    get playerId() {
        return this.state.playerId;
    }

    get myComponents() {
        return this.state.getEntityComponents(this.playerId);
    }

    /**
     * @param {"single-player"|"multiplayer"|"editor"} mode
     */
    run(mode = "single-player") {
        const game = this;

        // Init systems
        game.initRenderer();
        game.initMouseInput();
        game.initKeyboardInput();

        if (mode === "single-player") {
            game.subscriptions.push(action => {
                if (action.type !== SERVER_ACTION) return;
                game.dispatch(action.data);
            });
        }

        game.subscriptions.push(action => {
            if (action.type !== CLIENT_ACTION) return;
            if (action.data.id !== this.playerId) return;
            this.syncDispatch(action.data.action);
        });

        game.subscriptions.push(action => {
            if (action.type !== HIT_PLAYER) return;
            if (action.data.id !== this.playerId) return;
            this.bloodScreen = 500;
        });

        if (mode === "single-player") {
            const level = game.state.assets.level("level-1");
            game.dispatch(setMyPlayerId("player-1"));
            game.dispatch(loadLevel(level));
            game.dispatch(playerJoin("player-1", "Player"));
            game.dispatch(playerJoin("player-2", "Enemy player"));
        }

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

    syncDispatch(action) {
        this.dispatch(action);
        if (this.socket && this.socket.connected) {
            this.socket.emit("dispatch", action);
            this.syncMeDebounce();
        }
    }

    /**
     * @param {KeyboardEvent} ev
     */
    onKeyDown(ev) {
        const id = this.playerId;
        const input = KEY_BINDS[ev.keyCode];
        if (input !== undefined) {
            this.syncDispatch(setPlayerInput(id, input, true));
        }
    }

    /**
     * @param {KeyboardEvent} ev
     */
    onKeyUp(ev) {
        const id = this.playerId;
        const input = KEY_BINDS[ev.keyCode];
        if (input !== undefined) {
            this.syncDispatch(setPlayerInput(id, input, false));
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
        this.syncDispatch(setPlayerMouse(id, ver, hor));
    }

    /**
     * @param {MouseEvent} ev
     */
    onMouseDown(ev) {
        const id = this.playerId;
        const input = "shoot";
        this.syncDispatch(setPlayerInput(id, input, true));
    }

    /**
     * @param {MouseEvent} ev
     */
    onMouseUp(ev) {
        const id = this.playerId;
        const input = "shoot";
        this.syncDispatch(setPlayerInput(id, input, false));
    }

    destroy() {
        this.running = false;
        this.container.innerHTML = "";
        this.subscriptions = [];
    }

    loadAssets() {
        const models = [
            // Player model
            "player_head",
            "player_body",
            "player_pilot",
            "player_hover_board",
            "player_weapon",
            "muzzle_flash",

            // Tiles
            "tile_box-sm",
            "tile_box-md",
            "tile_box-lg",

            "tile_wall-sm",
            "tile_wall-md",
            "tile_wall-lg",

            "tile_floor-sm",
            "tile_floor-lg",

            "tile_pillar-sm",
            "tile_pillar-md"
        ];

        const assets = this.state.assets;
        assets.loadLevel("level-1", "levels/level.json");
        models.forEach(obj => assets.loadObj(obj));
        return assets.done();
    }

    initSocket() {
        return new Promise((resolve, reject) => {
            const url = location.href.replace(location.port, PORT);
            this.socket = SocketIO(url, { reconnection: true });
            this.socket.on("connect", () => resolve(this));
            this.socket.on("connect_error", () => reject(this));
        }).then(() => {
            console.log("Connected");

            const id = this.socket.id;
            this.dispatch(setMyPlayerId(id));

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
        this.renderer.setClearColor(0x63a9db, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMapDebug = true;

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

    render() {
        this.renderer.render(this.state.scene, this.state.camera);
        this.renderHUD();
    }

    renderHUD() {
        const { player, weapon, health } = this.myComponents;

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
        if (health !== undefined) {
            this.renderInfo({
                text: "HP",
                info: null,
                color: "limegreen",
                value: health,
                max: 100,
                x: this.hud.width * 0.5,
                y: this.hud.height - 50
            });
        }

        if (!this.socket || !this.socket.connected) {
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

        // Messages
        {
            const x = this.hud.width - 200;
            const y = 20;
            this.ctx.fillStyle = "white";
            this.ctx.font = "16px Arial";
            this.state.messages.forEach((row, index) => {
                this.ctx.fillText(row.msg, x, y + index * 16);
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
