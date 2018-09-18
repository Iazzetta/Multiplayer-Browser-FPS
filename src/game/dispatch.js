import * as THREE from "three";
import { Action } from "./actions.js";
import { State } from "./state.js";
import { Player, Bullet, Wall, JetpackPickup } from "./entities";
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

            // Tile size TILE
            const TILE = new THREE.Vector3(4, 4, 4);

            /**
             * Level layout
             *
             * 0: empty
             * 1: wall-tile
             * 2: player
             * 3: jetpack
             */
            const tiles = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
                [1, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];

            const rows = tiles.length;
            const cols = tiles[0].length;

            {
                // Add floor
                const geometry = new THREE.PlaneGeometry(1, 1);
                const material = new THREE.MeshLambertMaterial({
                    color: 0xffff00,
                    side: THREE.DoubleSide
                });
                const plane = new THREE.Mesh(geometry, material);
                plane.rotation.x = toRadians(90);
                plane.position.set(cols * TILE.x, 0, rows * TILE.z);
                plane.scale.set(
                    rows * TILE.x * 2,
                    rows * TILE.y * 2,
                    rows * TILE.z * 2
                );
                state.scene.add(plane);
            }

            // Add walls
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const tileId = tiles[r][c];
                    const entityId = ["entity", r, c].join("-");
                    const position = new THREE.Vector3(
                        r * TILE.x * 2,
                        TILE.y,
                        c * TILE.x * 2
                    );

                    if (tileId === 3) {
                        // App pickup
                        const pickup = new JetpackPickup(
                            entityId,
                            state.assets
                        );
                        pickup.object3D.position.copy(position);
                        state.addEntity(pickup);
                    }

                    if (tileId === 1) {
                        const mesh = state.assets.mesh("wall_tile");
                        mesh.scale.set(TILE.x * 2, TILE.y * 2, TILE.y * 2);
                        // mesh.visible = false;

                        const wall = new Wall(entityId, TILE, mesh);
                        wall.object3D.position.z = r * TILE.x * 2;
                        wall.object3D.position.x = c * TILE.x * 2;
                        wall.object3D.position.y = TILE.y;

                        state.addEntity(wall);
                    }
                }
            }

            // Add players
            playerIds.forEach(playerId => {
                const player = new Player(playerId, state.assets);
                player.object3D.position.set(2 * TILE.x, 0, 2 * TILE.x);
                state.addEntity(player);
            });

            // Create lights
            const keyLight = new THREE.DirectionalLight(
                new THREE.Color("#FFE4C4"),
                1.0
            );
            keyLight.position.set(-100, 50, 100);

            const fillLight = new THREE.DirectionalLight(
                new THREE.Color("#A6D8ED"),
                1.0
            );
            fillLight.position.set(100, 50, 100);

            const backLight = new THREE.DirectionalLight(
                new THREE.Color("#FFFFFF"),
                1.0
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
