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
 * @param {string} id
 */
export function playerJoin(id) {
    return new Action(PLAYER_JOIN, { id });
}

/**
 * @param {string} id
 */
export function playerLeave(id) {
    return new Action(PLAYER_LEAVE, { id });
}

/**
 * @param {string} id
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
export function spawnPlayer(id, x, y, z) {
    return new Action(SPAWN_PLAYER, { id, x, y, z });
}
