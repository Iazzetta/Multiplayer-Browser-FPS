import { State } from "./state";
import times from "lodash/times";

export const [
    // Special actions
    INIT_GAME,

    // Sync local actions
    SERVER_ACTION,
    CLIENT_ACTION,

    // Sync players
    PLAYER_JOIN,
    PLAYER_LEAVE,
    SYNC_PLAYER,
    SYNC_PLAYER_SCORE,
    SYNC_ALL_PLAYERS,

    // Spawn
    SPAWN_PLAYER,
    SPAWN_BULLET_PACK,
    SPAWN_HEALTH_PACK,

    // Player inputs
    SET_CAMERA_VIEW,
    SET_INPUT,
    SET_AIM,

    // Gameplay actions
    SHOOT_BULLET,
    RELOAD_START,
    RELOAD_DONE,
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
 * @param {string} name
 * @param {boolean} alive
 */
export function playerJoin(id, name, alive = false) {
    return new Action(PLAYER_JOIN, { id, name, alive });
}

/**
 * @param {string} id
 */
export function playerLeave(id) {
    return new Action(PLAYER_LEAVE, { id });
}

/**
 * @param {string} id
 */
export function spawnPlayer(id) {
    return new Action(SPAWN_PLAYER, { id });
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
 * @param {State} state
 */
export function syncAllPlayers(state) {
    return new Action(SYNC_ALL_PLAYERS, { players: state.players });
}

/**
 * @param {number} width
 * @param {number} height
 */
export function setCameraView(width, height) {
    return new Action(SET_CAMERA_VIEW, { width, height });
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
 */
export function shootBullet(id) {
    return new Action(SHOOT_BULLET, { id });
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
