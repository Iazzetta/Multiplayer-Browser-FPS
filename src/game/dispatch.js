import * as THREE from "three";
import map from "lodash/map";
import sample from "lodash/sample";
import { JUMP_SPEED } from "./consts.js";
import { State } from "./state.js";
import {
    PlayerEntity,
    WallEntity,
    PlayerGhostEntity,
    Entity
} from "./entities";
import {
    SERVER_ACTION,
    SERVER_CONNECTION,
    LOAD_LEVEL,
    PLAYER_JOIN,
    PLAYER_LEAVE,
    SET_PLAYER_CAMERA,
    SET_PLAYER_MOUSE,
    SYNC_GAME_STATE,
    SYNC_PLAYER,
    SYNC_PLAYER_SCORE,
    SPAWN_PLAYER,
    SET_CAMERA_VIEW,
    SET_INPUT,
    HIT_PLAYER,
    KILL_PLAYER,

    // Actions
    Action,
    playerLeave,
    spawnPlayer,
    playerJoin,
    setPlyerCamera
} from "./actions.js";
import { PlayerComponent } from "./components.js";

/**
 * @param {State} state
 * @param {Action} action
 */
export function dispatch(state, action) {
    switch (action.type) {
        case SERVER_CONNECTION: {
            const { id } = action.data;
            state.playerId = id;
            state.connected = true;
            return dispatch(state, setPlyerCamera(id));
        }
        case SERVER_ACTION: {
            if (!state.connected) {
                return dispatch(state, action.data);
            }
            return state;
        }
        case LOAD_LEVEL: {
            const { level } = action.data;

            state = new State(state.assets);
            state.time.start = Date.now();
            state.playerSpawns = [];

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
        case PLAYER_JOIN: {
            const { id, name } = action.data;
            const playerComp = new PlayerComponent({ id, name });
            const playerGhost = new PlayerGhostEntity(playerComp);
            playerGhost.object3D.position.copy(sample(state.playerSpawns));
            playerGhost.object3D.position.y += 30;
            state.addEntity(playerGhost);

            if (state.playerId === id) {
                return dispatch(state, setPlyerCamera(id));
            }
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

            if (state.playerId === id) {
                return dispatch(state, setPlyerCamera(id));
            }
            return state;
        }
        case SET_PLAYER_CAMERA: {
            const { id } = action.data;
            const player = state.getEntity(id);
            if (player !== undefined) {
                player.object3D.children.forEach(child => {
                    child.visible = false;
                });

                player.head.add(state.camera);
                player.head.visible = true;
                player.head.children.forEach(child => {
                    child.visible = false;
                });

                const weapon = state.assets.mesh("player_weapon");
                weapon.scale.multiplyScalar(0.5);
                weapon.position.x = 0.25;
                weapon.position.y = -0.25;
                weapon.position.z = -0.1;
                player.head.add(weapon);
            }
            return state;
        }
        case SET_PLAYER_MOUSE: {
            const { id, ver, hor } = action.data;
            const { object3D, head } = state.getEntityComponents(id);
            if (object3D && head) {
                object3D.rotation.y += ver;
                head.rotation.x += hor;
            }
            return state;
        }
        case SYNC_GAME_STATE: {
            /**
             * @type {Entity[]}
             */
            const players = action.data.players;
            const playerIds = map(players, "id");

            // Remove players
            state
                .getEntityGroup("player")
                .filter(player => playerIds.indexOf(player.id) === -1)
                .forEach(player => {
                    dispatch(state, playerLeave(player.id));
                });

            // Sync player data
            players.forEach(playerEntityData => {
                const { id, player, health, object3D } = playerEntityData;
                if (state.getEntity(id) === undefined) {
                    dispatch(state, playerJoin(player.id, player.name));
                    if (object3D && health) {
                        dispatch(state, spawnPlayer(id, object3D.position));
                    }
                }

                const entity = state.getEntity(id);
                if (entity.player && player) {
                    entity.player.input = entity.player.input;
                    entity.player.kills = entity.player.kills;
                    entity.player.deaths = entity.player.deaths;
                }

                if (entity.health && health) {
                    entity.health.hp = health.hp;
                    entity.health.max = health.max;
                }

                if (entity.object3D && object3D) {
                    entity.object3D.position.copy(object3D.position);
                }
            });

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

        // =======================================

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
        case HIT_PLAYER: {
            const { id, hp } = action.data;
            const { health, velocity, collider } = state.getEntityComponents(
                id
            );
            if (health) {
                health.hp = hp;
            }
            if (velocity && collider && collider.bottom()) {
                velocity.y = JUMP_SPEED * 0.5;
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
                        playerGhost.object3D.position.y,
                        player.object3D.position.z
                    );
                }
            }
            return state;
        }
        case SET_CAMERA_VIEW: {
            const { width, height } = action.data;
            state.camera.aspect = width / height;
            state.camera.updateProjectionMatrix();
            return state;
        }
        case SET_INPUT: {
            const { id, input, value } = action.data;
            const { player } = state.getEntityComponents(id);
            if (player !== undefined) {
                if (player.input[input] !== undefined) {
                    player.input[input] = value;
                }
            }
            return state;
        }

        default:
            return state;
    }
}
