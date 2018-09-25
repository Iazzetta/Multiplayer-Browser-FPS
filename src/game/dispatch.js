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
            state.playerIds = state.playerIds.filter(pid => pid !== id);
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
        case "INIT_GAME": {
            const { playerIds } = action.data;

            state = new State(state.assets);
            state.time.start = Date.now();
            state.playerIds = playerIds;

            forEachMapTile((id, x, y, z) => {
                const entity = createEntity(id, state);
                if (entity !== undefined) {
                    if (entity.object3D) {
                        entity.object3D.position.set(
                            TILE_SIZE * x,
                            TILE_SIZE * y,
                            TILE_SIZE * z
                        );
                    }
                    state.addEntity(entity);
                }
            });

            // Create lights
            const keyLight = new THREE.DirectionalLight(
                new THREE.Color("#FFE4C4"),
                1.0
            );
            keyLight.position.set(-100, 50, 100);

            const fillLight = new THREE.DirectionalLight(
                new THREE.Color("#A6D8ED"),
                0.1
            );
            fillLight.position.set(100, 50, 100);

            const backLight = new THREE.DirectionalLight(
                new THREE.Color("#FFFFFF"),
                0.5
            );
            backLight.position.set(100, 0, -100).normalize();

            state.scene.add(keyLight);
            state.scene.add(fillLight);
            state.scene.add(backLight);

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
