import * as THREE from "three";
import uniq from "lodash/uniq";
import without from "lodahs/without";
import { State } from "./state.js";
import {
    Entity,
    Player,
    Bullet,
    Wall,
    AmmoPickup,
    JetpackPickup,
    HpPickup
} from "./entities";
import {
    Action,
    PLAYER_JOIN,
    PLAYER_LEAVE,
    SYNC_PLAYER,
    SYNC_PLAYER_SCORE,
    SYNC_ALL_PLAYERS,
    SPAWN_PLAYER,
    SPAWN_BULLET_PACK,
    SPAWN_HEALTH_PACK,
    SET_CAMERA_VIEW,
    SET_INPUT,
    SET_AIM,
    SHOOT_BULLET,
    RELOAD_START,
    RELOAD_DONE,
    HIT_PLAYER,
    KILL_PLAYER
} from "./actions.js";

/**
 * @param {State} state
 * @param {Action} action
 */
export function dispatch(state, action) {
    switch (action.type) {
        case PLAYER_JOIN: {
            const { id } = action.data;
            state.playerIds = uniq(state.playerIds.concat([id]));
            return state;
        }
        case PLAYER_LEAVE: {
            const { id } = action.data;
            state.playerIds = without(state.playerIds, [id]);
            return state;
        }
        case SYNC_PLAYER: {
            const { id, x, y, z, vx, vy, vz, rx, ry } = action.data;
            const player = state.getEntity(id);
            if (player !== undefined) {
                if (player.head !== undefined) {
                    player.head.rotation.x = rx;
                }

                if (player.object3D !== undefined) {
                    player.object3D.position.set(x, y, z);
                    player.object3D.rotation.y = ry;
                }

                if (player.velocity !== undefined) {
                    player.velocity.set(vx, vy, vz);
                }
            }
            return state;
        }
        case SYNC_PLAYER_SCORE: {
            const {} = action.data;
            return state;
        }
        case SYNC_ALL_PLAYERS: {
            const {} = action.data;
            return state;
        }
        case SPAWN_PLAYER: {
            const {} = action.data;
            return state;
        }
        case SPAWN_BULLET_PACK: {
            const {} = action.data;
            return state;
        }
        case SPAWN_HEALTH_PACK: {
            const {} = action.data;
            return state;
        }
        case SET_CAMERA_VIEW: {
            const {} = action.data;
            return state;
        }
        case SET_INPUT: {
            const {} = action.data;
            return state;
        }
        case SET_AIM: {
            const {} = action.data;
            return state;
        }
        case SHOOT_BULLET: {
            const {} = action.data;
            return state;
        }
        case RELOAD_START: {
            const {} = action.data;
            return state;
        }
        case RELOAD_DONE: {
            const {} = action.data;
            return state;
        }
        case HIT_PLAYER: {
            const {} = action.data;
            return state;
        }
        case KILL_PLAYER: {
            return state;
        }
        default:
            return state;
    }
}
