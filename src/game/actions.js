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
