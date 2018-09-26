import * as THREE from "three";
import { TILE_SIZE } from "./consts.js";
import { Action } from "./actions.js";
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
import { forEachMapTile } from "./utils.js";

/**
 * @param {State} state
 * @param {Action} action
 */
export function dispatch(state, action) {
    switch (action.type) {
        case "SET_HP": {
            const { playerId, hp } = action.data;
            const { health } = state.getEntityComponents(playerId);
            if (health !== undefined) {
                health.hp = hp;
            }
            return state;
        }
        case "KILL": {
            const { id } = action.data;
            state.deleteEntity(id);
            return state;
        }
        case "SYNC_PLAYER": {
            const { playerId, x, y, z, vx, vy, vz, rx, ry } = action.data;
            const player = state.getEntity(playerId);
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
        case "SET_SCREEN_SIZE": {
            const { width, height } = action.data;
            state.camera.aspect = width / height;
            state.camera.updateProjectionMatrix();
            return state;
        }
        case "SET_PLAYER_INPUT": {
            const { playerId, input, value } = action.data;
            const { controller } = state.getEntityComponents(playerId);
            if (controller !== undefined) {
                if (controller.input[input] !== undefined) {
                    controller.input[input] = value;
                }
            }
            return state;
        }
        case "SET_PLAYER_AIM": {
            const { playerId, ver, hor } = action.data;
            const { object3D, head } = state.getEntityComponents(playerId);
            if (object3D && head) {
                object3D.rotation.y = ver;
                head.rotation.x = hor;
            }
            return state;
        }
        case "SHOOT_BULLET": {
            const { playerId } = action.data;
            const player = state.getEntity(playerId);
            if (player && player.object3D && player.head) {
                // Create bullet
                const bulletId = playerId + Date.now().toString(16);
                const bullet = new Bullet(bulletId, state.assets);
                bullet.damage.creatorId = player.id;

                // Set velocity
                const bulletSpeed = 0.05;
                const direction = player.head.getFacingDirection();
                bullet.velocity.z = direction.z * bulletSpeed;
                bullet.velocity.x = direction.x * bulletSpeed;
                bullet.velocity.y = direction.y * bulletSpeed;

                // Set position
                const playerAABB = player.object3D.getAABB();
                bullet.object3D.position.x = player.object3D.position.x;
                bullet.object3D.position.y = playerAABB.max.y - 0.5;
                bullet.object3D.position.z = player.object3D.position.z;

                // Offset infrotn of camera
                const DIST = 1.25;
                const offset = new THREE.Vector3();
                offset.copy(bullet.velocity);
                offset.normalize();
                offset.multiply(new THREE.Vector3(DIST, DIST, DIST));
                bullet.object3D.position.add(offset);

                state.addEntity(bullet);
            }
            return state;
        }
        case "INIT_GAME": {
            const { playerIds } = action.data;

            state = new State(state.assets);
            state.time.start = Date.now();
            state.playerIds = playerIds;
            state.playerSpawns = [];

            forEachMapTile((id, x, y, z) => {
                const entity = createEntity(id, state);
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

            return state;
        }
        case "SYNC_GAME_STATE": {
            const { playerIds } = action.data;
            const spawns = state.playerSpawns;

            // Add player
            playerIds.forEach((id, index) => {
                const player = state.getEntity(id);
                if (player === undefined) {
                    const player = new Player(id, state.assets);
                    const spawn = spawns[index % spawns.length];

                    player.object3D.position.copy(spawn);
                    state.addEntity(player);
                }
            });

            // Remove missing players
            state.playerIds
                .filter(id => playerIds.indexOf(id) === -1)
                .forEach(id => state.deleteEntity(id));

            state.playerIds = playerIds;

            return state;
        }
    }
    return state;
}

/**
 * @param {number} tileId
 * @param {State} state
 * @return {Entity}
 */
export function createEntity(tileId, state) {
    const entityId = (128 + state.entities.size).toString(16);
    const assets = state.assets;
    switch (tileId) {
        case 1: {
            const index = state.getEntityGroup("player").length;
            const playerId = state.playerIds[index];
            if (playerId !== undefined) {
                return new Player(playerId, assets);
            }
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
