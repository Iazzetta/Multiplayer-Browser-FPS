import * as THREE from "three";
import sample from "lodash/sample";
import clamp from "lodash/clamp";
import { State } from "./state.js";
import {
    PlayerEntity,
    WallEntity,
    PlayerGhostEntity,
    TileEntity
} from "./entities";
import {
    SET_MY_PLAYER_ID,
    LOAD_LEVEL,
    LOAD_LEVEL_WIP,
    PLAYER_JOIN,
    PLAYER_LEAVE,
    SET_PLAYER_MOUSE,
    SYNC_GAME_STATE,
    SYNC_PLAYER,
    SYNC_PLAYER_SCORE,
    SPAWN_PLAYER,
    SET_ASPECT_RATIO,
    SET_PLAYER_INPUT,
    HIT_PLAYER,
    KILL_PLAYER,

    // Actions
    Action,
    spawnPlayer,
    playerJoin
} from "./actions.js";
import { PlayerComponent } from "./components.js";

/**
 * @param {State} state
 * @param {Action} action
 */
export function dispatch(state, action) {
    switch (action.type) {
        case SET_MY_PLAYER_ID: {
            const { id } = action.data;
            state.playerId = id;
            return state;
        }
        case LOAD_LEVEL: {
            const { level } = action.data;
            state = new State(state);

            level.forEach(obj => {
                const position = new THREE.Vector3();
                position.copy(obj.position);

                const size = new THREE.Vector3();
                size.copy(obj.size);

                switch (obj.type) {
                    case "player":
                        state.playerSpawns.push(position.clone());
                        break;
                    case "wall":
                        const wall = new WallEntity(obj.id, state.assets, size);
                        wall.object3D.position.copy(position);
                        state.addEntity(wall);
                        break;
                }
            });

            return state;
        }
        case LOAD_LEVEL_WIP: {
            const { level } = action.data;
            state = new State(state);

            const assets = state.assets;
            level.tiles.forEach(tile => {
                console.log(tile.id);
                const entity = new TileEntity(tile.id, assets, {
                    mesh: tile.mesh,
                    size: new THREE.Vector3().copy(tile.size)
                });
                entity.object3D.position.copy(tile.position);
                state.addEntity(entity);
            });

            return state;
        }
        case PLAYER_JOIN: {
            const { id, name } = action.data;
            const playerComp = new PlayerComponent({ id, name });
            const playerGhost = new PlayerGhostEntity(playerComp);
            const spawn = sample(state.playerSpawns) || new THREE.Vector3();
            playerGhost.object3D.position.copy(spawn);
            playerGhost.object3D.position.y += 30;
            state.addEntity(playerGhost);
            return state;
        }
        case PLAYER_LEAVE: {
            const { id } = action.data;
            state.deleteEntity(id);
            return state;
        }
        case SPAWN_PLAYER: {
            const { id, spawn } = action.data;
            const playerGhost = state.getEntity(id);
            if (playerGhost && playerGhost.player) {
                const player = new PlayerEntity(
                    playerGhost.player,
                    state.assets
                );
                player.object3D.position.copy(spawn);
                state.addEntity(player);
            }
            return state;
        }
        case SET_PLAYER_MOUSE: {
            const { id, ver, hor } = action.data;
            const { object3D, playerModel } = state.getEntityComponents(id);
            if (object3D && playerModel) {
                object3D.rotation.y += ver;
                playerModel.head.rotation.x += hor;
                playerModel.head.rotation.x = clamp(
                    playerModel.head.rotation.x,
                    -1.6,
                    1.6
                );
            }
            return state;
        }
        case SET_PLAYER_INPUT: {
            const { id, input, value } = action.data;
            const { player } = state.getEntityComponents(id);
            if (player !== undefined) {
                if (player.input[input] !== undefined) {
                    player.input[input] = value;
                }
            }
            return state;
        }
        case SYNC_PLAYER_SCORE: {
            const { id, kills, deaths } = action.data;
            const { player } = state.getEntityComponents(id);
            if (player) {
                player.kills = kills;
                player.deaths = deaths;
            }
            return state;
        }
        case SET_ASPECT_RATIO: {
            const { width, height } = action.data;
            state.setCameraSize(width, height);
            return state;
        }
        case HIT_PLAYER: {
            const { id, hp } = action.data;
            const entity = state.getEntity(id);
            if (entity && entity.health !== undefined) {
                entity.health = hp;
            }
            return state;
        }
        case KILL_PLAYER: {
            const { id } = action.data;
            const player = state.getEntity(id);
            if (player !== undefined) {
                const playerGhost = new PlayerGhostEntity(player.player);
                state.addEntity(playerGhost);
                if (player.object3D) {
                    playerGhost.object3D.position.set(
                        player.object3D.position.x,
                        player.object3D.position.y + 30,
                        player.object3D.position.z
                    );
                }
            }
            return state;
        }
        case SYNC_PLAYER: {
            const {
                id,
                player,
                health,
                velocity,
                object3D,
                playerModelHead
            } = action.data;

            if (state.getEntity(id) === undefined) {
                dispatch(state, playerJoin(player.id, player.name));
                if (object3D && health) {
                    dispatch(state, spawnPlayer(id, object3D.position));
                }
            }

            const entity = state.getEntity(id);
            if (entity.player && player) {
                entity.player.input = player.input;
                entity.player.kills = player.kills;
                entity.player.deaths = player.deaths;
                entity.player.state = player.state;
                entity.player.respawnTimer = player.respawnTimer;
            }

            if (entity.health && health !== undefined) {
                entity.health = health;
            }

            if (entity.object3D && object3D) {
                entity.object3D.position.copy(object3D.position);
                entity.object3D.rotation.copy(object3D.rotation);
            }

            if (entity.playerModel && playerModelHead) {
                entity.playerModel.head.position.copy(playerModelHead.position);
                entity.playerModel.head.rotation.copy(playerModelHead.rotation);
            }

            if (entity.velocity && velocity) {
                entity.velocity.x = velocity.x;
                entity.velocity.y = velocity.y;
            }

            return state;
        }
        case SYNC_GAME_STATE: {
            const { syncPlayerActions } = action.data;
            syncPlayerActions.forEach(syncPlayer => {
                dispatch(state, syncPlayer);
            });
            return state;
        }
        default:
            return state;
    }
}
