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

            // Add map
            state.assets.map1.children.concat().map((block, index) => {
                const platformId = ["plathform", index].toString();
                const platform = new Platform(platformId);
                platform.body.add(block);
                state.addEntity(platform);
            });

            // Add players
            playerIds.forEach(playerId => {
                const player = new Player(playerId);
                player.body.position.y = 0.5;
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
            const { body, head } = state.getEntity(playerId);
            if (body && head) {
                body.rotation.y = ver;
                head.rotation.x = hor;
            }
            return state;
        }
    }
    return state;
}
