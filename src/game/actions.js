import { State } from "./state";
import { PlayerComponent } from "./components";
import times from "lodash/times";

export const [
    LOAD_LEVEL,
    SERVER_ACTION,
    PLAYER_JOIN,
    PLAYER_LEAVE,
    SYNC_PLAYER,
    SYNC_PLAYER_SCORE,
    SYNC_ALL_PLAYERS,
    SPAWN_PLAYER,
    SET_CAMERA_VIEW,
    SET_INPUT,
    SET_AIM,
    HIT_PLAYER,
    KILL_PLAYER
] = times(100);

export class Action {
    /**
     * @param {number} type
     * @param {object} data
     */
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}

/**
 * @param {object} level
 */
export function loadLevel(level) {
    return new Action(LOAD_LEVEL, { level });
}

/**
 * @param {string} id
 * @param {string} name
 */
export function playerJoin(id, name) {
    return new Action(PLAYER_JOIN, { id, name });
}

/**
 * @param {number} width
 * @param {number} height
 */
export function setAspectRatio(width, height) {
    return new Action(SET_CAMERA_VIEW, { width, height });
}

/**
 * @param {Action} action
 */
export function serverAction(action) {
    return new Action(SERVER_ACTION, action);
}

export function initGame() {
    return new Action(INIT_GAME, {});
}

/**
 * @param {string} id
 */
export function playerLeave(id) {
    return new Action(PLAYER_LEAVE, { id });
}

/**
 * @param {PlayerComponent} player
 * @param {THREE.Vector3} spawn
 */
export function spawnPlayer(player, spawn) {
    return new Action(SPAWN_PLAYER, { player, spawn });
}

/**
 * @param {string} id
 * @param {State} state
 */
export function syncPlayer(id, state) {
    const { head, object3D, velocity } = state.getEntityComponents(id);
    if (object3D === undefined) return;
    if (velocity === undefined) return;
    if (head === undefined) return;

    const { x, y, z } = object3D.position;
    const { x: vx, y: vy, z: vz } = velocity;
    const rx = head.rotation.x;
    const ry = object3D.rotation.y;
    return new Action(SYNC_PLAYER, {
        id,
        x,
        y,
        z,
        vx,
        vy,
        vz,
        rx,
        ry
    });
}

/**
 * @param {string} id
 * @param {number} kills
 * @param {number} deaths
 */
export function syncPlayerScore(id, kills, deaths) {
    return new Action(SYNC_PLAYER_SCORE, { id, kills, deaths });
}

/**
 * @param {State} state
 */
export function syncAllPlayers(state) {
    const players = state
        .getEntityGroup("player")
        .map(player => player.player)
        .filter(player => player);
    return new Action(SYNC_ALL_PLAYERS, { players });
}

/**
 * @param {string} id
 * @param {string} input
 * @param {boolean} value
 */
export function setPlayerInput(id, input, value) {
    return new Action(SET_INPUT, { id, input, value });
}

/**
 * @param {string} id
 * @param {number} ver
 * @param {number} hor
 */
export function setPlayerAim(id, ver, hor) {
    return new Action(SET_AIM, { id, ver, hor });
}

/**
 * @param {string} id
 * @param {number} hp
 */
export function hitPlayer(id, hp) {
    return new Action(HIT_PLAYER, { id, hp });
}

/**
 * @param {string} id
 */
export function killPlayer(id) {
    return new Action(KILL_PLAYER, { id });
}
