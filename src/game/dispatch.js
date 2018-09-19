import * as THREE from "three";
import { TILE_SIZE } from "./consts.js";
import { Action } from "./actions.js";
import { State } from "./state.js";
import {
    Entity,
    Player,
    Bullet,
    Wall,
    JetpackPickup,
    BulletkPickup
} from "./entities";
import { toRadians } from "./utils.js";

/**
 * @param {State} state
 * @param {Action} action
 */
export function dispatch(state, action) {
    switch (action.type) {
        case "INIT_GAME": {
            const { playerIds } = action.data;

            state = new State(state.assets);
            state.time.start = Date.now();
            state.playerIds = playerIds;

            /**
             * Level layout
             *
             * 0: empty
             * 1: wall-tile
             * 2: player
             * 3: jetpack
             * 4: bullets
             */
            const tiles = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 2, 0, 2, 0, 2, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 3, 4, 1, 4, 3, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];

            const rows = tiles.length;
            const cols = tiles[0].length;

            // Add entities
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const tileId = tiles[r][c];
                    const entity = createEntity(tileId, state);
                    if (entity !== undefined) {
                        if (entity.object3D) {
                            entity.object3D.position.set(
                                TILE_SIZE * r,
                                TILE_SIZE * 0.5,
                                TILE_SIZE * c
                            );
                        }
                        state.addEntity(entity);
                    }
                }
            }

            // Add floor
            const geometry = new THREE.PlaneGeometry(1, 1);
            const material = new THREE.MeshLambertMaterial({
                color: 0xffff00,
                side: THREE.DoubleSide
            });
            const plane = new THREE.Mesh(geometry, material);
            plane.rotation.x = toRadians(90);
            plane.position.set(cols * TILE_SIZE, 0, rows * TILE_SIZE);
            plane.scale.set(
                rows * TILE_SIZE * 2,
                rows * TILE_SIZE * 2,
                rows * TILE_SIZE * 2
            );
            state.scene.add(plane);

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
            const { controller } = state.getEntity(playerId);
            if (controller !== undefined) {
                if (controller.input[input] !== undefined) {
                    controller.input[input] = value;
                }
            }
            return state;
        }
        case "SET_PLAYER_AIM": {
            const { playerId, ver, hor } = action.data;
            const { object3D, head } = state.getEntity(playerId);
            if (object3D && head) {
                object3D.rotation.y = ver;
                head.rotation.x = hor;
            }
            return state;
        }
        case "SHOOT_BULLET": {
            const { playerId } = action.data;
            const player = state.getEntity(playerId);
            if (player.object3D && player.head) {
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
        case 2: {
            const index = state.getEntityGroup("player").length;
            const playerId = state.playerIds[index];
            if (playerId !== undefined) {
                return new Player(playerId, assets);
            }
        }
        case 1: {
            return new Wall(entityId, assets);
        }
        case 3: {
            return new JetpackPickup(entityId, assets);
        }
        case 4: {
            return new BulletkPickup(entityId, assets);
        }
    }
}
