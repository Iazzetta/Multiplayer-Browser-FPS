import * as THREE from "three";
import { Action } from "./actions.js";
import { State } from "./state.js";
import { Player, Platform } from "./entities";

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

            // Add platforms
            const TILE_SIZE = 8;
            for (let r = 0; r < state.level.tiles.length; r++) {
                const row = state.level.tiles[r];
                for (let c = 0; c < row.length; c++) {
                    const tileId = row[c];
                    if (tileId > 0) {
                        const mesh = state.assets.mesh("tile");
                        const platformId = ["tile", r, c].join("-");
                        const platform = new Platform(platformId, mesh);
                        platform.object3D.scale.z = TILE_SIZE;
                        platform.object3D.scale.x = TILE_SIZE;
                        platform.object3D.scale.y = TILE_SIZE;
                        platform.object3D.position.z = r * TILE_SIZE;
                        platform.object3D.position.x = c * TILE_SIZE;
                        platform.object3D.position.y = TILE_SIZE / 2;

                        state.addEntity(platform);
                    }
                }
            }

            // Add players
            playerIds.forEach(playerId => {
                const player = new Player(playerId, state.assets);
                player.object3D.position.set(2 * TILE_SIZE, 0, 2 * TILE_SIZE);
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
    }
    return state;
}
