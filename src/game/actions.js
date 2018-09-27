import { State } from "./state";

export class Action {
    /**
     * @param {string} type
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
    return new Action("SERVER_ACTION", action);
}

/**
 * @param {string[]} playerIds
 */
export function initGame(playerIds) {
    return new Action("INIT_GAME", { playerIds });
}

/**
 * @param {number} width
 * @param {number} height
 */
export function setScreenSize(width, height) {
    return new Action("SET_SCREEN_SIZE", { width, height });
}

/**
 * @param {string} playerId
 * @param {string} input
 * @param {boolean} value
 */
export function setPlayerInput(playerId, input, value) {
    return new Action("SET_PLAYER_INPUT", { playerId, input, value });
}

/**
 * @param {string} playerId
 * @param {number} ver
 * @param {number} hor
 */
export function setPlayerAim(playerId, ver, hor) {
    return new Action("SET_PLAYER_AIM", { playerId, ver, hor });
}

/**
 * @param {string} playerId
 */
export function shootBullet(playerId) {
    return new Action("SHOOT_BULLET", { playerId });
}

/**
 * @param {string} playerId
 * @param {number} hp
 */
export function setHP(playerId, hp) {
    return new Action("SET_HP", { playerId, hp });
}

/**
 * @param {string} id
 */
export function kill(id) {
    return new Action("KILL", { id });
}

/**
 * @param {string[]} playerIds
 */
export function syncGameState(playerIds) {
    return new Action("SYNC_GAME_STATE", { playerIds });
}

/**
 * @param {string} playerId
 * @param {State} state
 */
export function syncPlayer(playerId, state) {
    const { head, object3D, velocity } = state.getEntityComponents(playerId);
    if (object3D == undefined) return;

    const { x, y, z } = object3D.position;
    const { x: vx, y: vy, z: vz } = velocity;
    const rx = head.rotation.x;
    const ry = object3D.rotation.y;
    return new Action("SYNC_PLAYER", {
        playerId,
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
