import * as THREE from "three";
import map from "lodash/map";
import { TILE_SIZE, JUMP_SPEED } from "./consts.js";
import { State } from "./state.js";
import {
    Entity,
    PlayerEntity,
    WallEntity,
    AmmoPickupEntity,
    HpPickupEntity,
    PlayerGhostEntity
} from "./entities";
import {
    INIT_GAME,
    PLAYER_JOIN,
    PLAYER_LEAVE,
    SYNC_PLAYER,
    SYNC_PLAYER_SCORE,
    SYNC_ALL_PLAYERS,
    SPAWN_PLAYER,
    SET_CAMERA_VIEW,
    SET_INPUT,
    SET_AIM,
    RELOAD_START,
    RELOAD_DONE,
    HIT_PLAYER,
    KILL_PLAYER,

    // Actions
    Action,
    playerLeave,
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
        case PLAYER_JOIN: {
            const { player } = action.data;
            const playerGhost = new PlayerGhostEntity(player);
            state.addEntity(playerGhost);
            return state;
        }
        case SPAWN_PLAYER: {
            /**
             * @type {PlayerComponent}
             */
            const player = action.data.player;

            /**
             * @type {THREE.Vector3}
             */
            const spawn = action.data.spawn;

            const playerGhost = state.getEntity(player.id);
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
        case SYNC_PLAYER_SCORE: {
            const { id, kills, deaths } = action.data;
            const { player } = state.getEntityComponents(id);
            if (player) {
                player.kills = kills;
                player.deaths = deaths;
            }
            return state;
        }
        case PLAYER_LEAVE: {
            const { id } = action.data;
            state.deleteEntity(id);
            return state;
        }
        case SYNC_ALL_PLAYERS: {
            /**
             * @type {PlayerComponent[]}
             */
            const players = action.data.players;

            // Sync player data
            players.forEach(playerComp => {
                const { id } = playerComp;
                if (state.getEntity(id) === undefined) {
                    dispatch(state, playerJoin(playerComp));
                }

                const player = state.getEntity(id);
                if (player.player !== undefined) {
                    for (const key in player.player) {
                        if (playerComp[key] !== undefined) {
                            player.player[key] = playerComp[key];
                        }
                    }

                    // Spawn entity if playe is alive
                    const isAlive = player.player.respawnTimer === 0;
                    if (isAlive && player.health === undefined) {
                        const spawn = new THREE.Vector3(0, 0, 0);
                        dispatch(state, spawnPlayer(player.player, spawn));
                    }
                }
            });

            // Remove players that maybe haven't been removed yet
            const playerIds = map(players, "id");
            state
                .getEntityGroup("player")
                .filter(player => playerIds.indexOf(player.id) === -1)
                .map(player => playerLeave(player.id))
                .forEach(playerLeave => dispatch(state, playerLeave));

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
            const { controller } = state.getEntityComponents(id);
            if (controller !== undefined) {
                if (controller.input[input] !== undefined) {
                    controller.input[input] = value;
                }
            }
            return state;
        }
        case SET_AIM: {
            const { id, ver, hor } = action.data;
            const { object3D, head } = state.getEntityComponents(id);
            if (object3D && head) {
                object3D.rotation.y = ver;
                head.rotation.x = hor;
            }
            return state;
        }
        case RELOAD_START: {
            const { id } = action.data;
            const { weapon } = state.getEntityComponents(id);
            if (weapon) {
                weapon.reloadTimer = weapon.type.reloadSpeed;
            }
            return state;
        }
        case RELOAD_DONE: {
            const { id } = action.data;
            const { weapon } = state.getEntityComponents(id);
            if (weapon) {
                const delta = weapon.type.maxLoadedAmmo - weapon.loadedAmmo;
                const reload = Math.min(delta, weapon.reservedAmmo);
                if (reload > 0) {
                    weapon.loadedAmmo += reload;
                    weapon.reservedAmmo -= reload;
                }
                weapon.reloadTimer = 0;
            }
            return state;
        }
        case INIT_GAME: {
            state = new State(state.assets);
            state.time.start = Date.now();
            state.playerSpawns = [];

            const level = state.assets.level("level-1");
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

            // Create lights ...
            const dirLight = (color, int) => {
                return new THREE.DirectionalLight(new THREE.Color(color), int);
            };

            var light = new THREE.AmbientLight(0x404040);
            state.scene.add(light);

            const keyLight = dirLight("#FFE4C4", 0.74);
            keyLight.position.set(-100, 50, 100);
            state.scene.add(keyLight);

            const fillLight = dirLight("#A6D8ED", 0.25);
            fillLight.position.set(100, 50, 100);
            state.scene.add(fillLight);

            const backLight = dirLight("#FFFFFF", 0.5);
            backLight.position.set(100, 0, -100).normalize();
            state.scene.add(backLight);

            return state;
        }
        default:
            return state;
    }
}
