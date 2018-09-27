import * as THREE from "three";
import map from "lodash/map";
import uniqBy from "lodash/uniqBy";
import random from "lodash/random";
import { TILE_SIZE, BULLET_SPEED } from "./consts.js";
import { State } from "./state.js";
import { forEachMapTile } from "./utils.js";
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
    INIT_GAME,
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
    KILL_PLAYER,

    // Actions
    Action,
    playerLeave,
    spawnPlayer,
    playerJoin
} from "./actions.js";

/**
 * @param {State} state
 * @param {Action} action
 */
export function dispatch(state, action) {
    switch (action.type) {
        case PLAYER_JOIN: {
            const { id, name, alive } = action.data;
            state.players.push({ id, name, alive });
            state.players = uniqBy(state.players, "id");
            return state;
        }
        case PLAYER_LEAVE: {
            const { id } = action.data;
            state.deleteEntity(id);
            state.players = state.players.filter(player => player.id !== id);
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
            // TODO ...
            return state;
        }
        case SYNC_ALL_PLAYERS: {
            const { players } = action.data;

            // Remove players that maybe haven't been removed yet
            const playerIds = map(players, "id");
            state.players
                .map(player => player.id)
                .filter(id => playerIds.indexOf(id) === -1)
                .forEach(id => dispatch(state, playerLeave(id)));

            // Add missing players
            players.forEach(player => {
                const { id, name, alive } = player;
                dispatch(state, playerJoin(id, name, alive));
                if (alive && state.getEntity(id) === undefined) {
                    dispatch(state, spawnPlayer(id));
                }
            });

            return state;
        }
        case SPAWN_PLAYER: {
            const { id } = action.data;
            const player = new Player(id, state.assets);
            const playerData = state.players.find(p => p.id === player.id);
            const index = state.players.indexOf(playerData);
            const spawn = state.playerSpawns[index % state.playerSpawns.length];
            if (spawn !== undefined) {
                playerData.alive = true;
                player.object3D.position.copy(spawn);
                state.addEntity(player);
            } else {
                console.warn("No spawns.");
            }
            return state;
        }
        case SPAWN_BULLET_PACK: {
            const {} = action.data;
            // TODO ...
            return state;
        }
        case SPAWN_HEALTH_PACK: {
            const {} = action.data;
            // TODO ...
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
        case SHOOT_BULLET: {
            const { id } = action.data;
            const player = state.getEntity(id);
            if (player && player.object3D && player.head) {
                // Create bullet
                const bulletId = player.id + Date.now().toString(16);
                const bullet = new Bullet(bulletId, state.assets);
                bullet.damage.creatorId = player.id;

                // Set velocity
                const direction = player.head.getFacingDirection();
                bullet.velocity.z = direction.z * BULLET_SPEED;
                bullet.velocity.x = direction.x * BULLET_SPEED;
                bullet.velocity.y = direction.y * BULLET_SPEED;

                // Spread - randomize
                bullet.velocity.z += random(-100, 100) * 0.000025;
                bullet.velocity.x += random(-100, 100) * 0.000025;
                bullet.velocity.y += random(-100, 100) * 0.000025;

                // Set position
                const playerAABB = player.object3D.getAABB();
                bullet.object3D.position.x = player.object3D.position.x;
                bullet.object3D.position.y = playerAABB.max.y - 0.5;
                bullet.object3D.position.z = player.object3D.position.z;

                // Rotate - randomize
                bullet.object3D.rotation.set(
                    random(-1, 1) * 0.1,
                    random(-1, 1) * 0.1,
                    random(-1, 1) * 0.1
                );

                // Offset infrotn of camera
                const DIST = 0.75;
                const offset = new THREE.Vector3();
                offset.copy(bullet.velocity);
                offset.normalize();
                offset.multiply(new THREE.Vector3(DIST, DIST, DIST));
                bullet.object3D.position.add(offset);

                state.addEntity(bullet);
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
        case HIT_PLAYER: {
            const { id, hp } = action.data;
            const { health } = state.getEntityComponents(id);
            if (health) {
                health.hp = hp;
            }
            return state;
        }
        case KILL_PLAYER: {
            const { id } = action.data;
            const playerData = state.players.find(p => p.id === id);
            if (playerData) {
                playerData.alive = false;
            }
            state.deleteEntity(id);
            return state;
        }
        case INIT_GAME: {
            state = new State(state.assets);
            state.time.start = Date.now();
            state.players = [];
            state.playerSpawns = [];

            forEachMapTile((id, x, y, z) => {
                const entity = createEntity(id);
                const vector = new THREE.Vector3(
                    TILE_SIZE * x,
                    TILE_SIZE * y,
                    TILE_SIZE * z
                );

                if (entity !== undefined) {
                    if (entity.object3D) {
                        entity.object3D.position.copy(vector);
                    }
                    state.addEntity(entity);
                }

                // Save player spawn
                if (id === 1) {
                    state.playerSpawns.push(vector.clone());
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

            /**
             * @param {number} tileId
             * @return {Entity}
             */
            function createEntity(tileId) {
                const entityId = (128 + state.entities.size).toString(16);
                const assets = state.assets;
                switch (tileId) {
                    case 1: {
                        // Player spawner
                        return;
                    }
                    case 2: {
                        return new Wall(entityId, assets);
                    }
                    case 3: {
                        return new AmmoPickup(entityId, assets);
                    }
                    case 4: {
                        return new JetpackPickup(entityId, assets);
                    }
                    case 5: {
                        return new HpPickup(entityId, assets);
                    }
                }
            }

            return state;
        }
        default:
            return state;
    }
}
