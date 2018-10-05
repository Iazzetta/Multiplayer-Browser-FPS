import { State } from "./state";
import { createActionType } from "./utils";

export const SERVER_ACTION = createActionType("SERVER_ACTION");
export const CLIENT_ACTION = createActionType("CLIENT_ACTION");
export const LOAD_LEVEL = createActionType("LOAD_LEVEL");
export const SET_MY_PLAYER_ID = createActionType("SET_MY_PLAYER_ID");
export const PLAYER_JOIN = createActionType("PLAYER_JOIN");
export const PLAYER_LEAVE = createActionType("PLAYER_LEAVE");
export const SYNC_PLAYER = createActionType("SYNC_PLAYER");
export const SYNC_PLAYER_SCORE = createActionType("SYNC_PLAYER_SCORE");
export const SYNC_GAME_STATE = createActionType("SYNC_GAME_STATE");
export const SPAWN_PLAYER = createActionType("SPAWN_PLAYER");
export const SET_ASPECT_RATIO = createActionType("SET_ASPECT_RATIO");
export const SET_PLAYER_INPUT = createActionType("SET_PLAYER_INPUT");
export const SET_PLAYER_MOUSE = createActionType("SET_PLAYER_MOUSE");
export const HIT_PLAYER = createActionType("HIT_PLAYER");
export const KILL_PLAYER = createActionType("KILL_PLAYER");

export class Action {
    /**
     * @param {number|string} type
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

/**
 * @param {string} id
 * @param {Action} action
 */
export function clientAction(id, action) {
    return new Action(CLIENT_ACTION, { id, action });
}

/**
 * @param {string} id
 */
export function setMyPlayerId(id) {
    return new Action(SET_MY_PLAYER_ID, { id });
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
 * @param {string} id
 */
export function playerLeave(id) {
    return new Action(PLAYER_LEAVE, { id });
}

/**
 * @param {string} id
 * @param {THREE.Vector3} spawn
 */
export function spawnPlayer(id, spawn) {
    return new Action(SPAWN_PLAYER, { id, spawn });
}

/**
 * @param {number} width
 * @param {number} height
 */
export function setAspectRatio(width, height) {
    return new Action(SET_ASPECT_RATIO, { width, height });
}

/**
 * @param {string} id
 * @param {string} input
 * @param {boolean} value
 */
export function setPlayerInput(id, input, value) {
    return new Action(SET_PLAYER_INPUT, { id, input, value });
}

/**
 * @param {string} id
 * @param {number} ver
 * @param {number} hor
 */
export function setPlayerMouse(id, ver, hor) {
    return new Action(SET_PLAYER_MOUSE, { id, ver, hor });
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

/**
 * @param {string} id
 * @param {State} state
 */
export function syncPlayer(id, state) {
    const player = state.getEntityComponents(id);

    const getData3D = group => {
        if (group !== undefined) {
            return {
                position: group.position,
                rotation: group.rotation
            };
        }
    };

    return new Action(SYNC_PLAYER, {
        id: player.id,
        player: player.player,
        health: player.health,
        velocity: player.velocity,
        object3D: getData3D(player.object3D),
        heroModelHead: getData3D(player.heroModel.head)
    });
}

/**
 * @param {State} state
 */
export function syncGameState(state) {
    const syncPlayerActions = state
        .getEntityGroup("player")
        .map(player => player.id)
        .map(id => syncPlayer(id, state));
    return new Action(SYNC_GAME_STATE, { syncPlayerActions });
}
