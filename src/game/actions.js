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
