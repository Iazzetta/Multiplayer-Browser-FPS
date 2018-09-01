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
 * @param {string} playerId
 */
export function addPlayer(playerId) {
    return new Action("ADD_PLAYER", { playerId });
}
