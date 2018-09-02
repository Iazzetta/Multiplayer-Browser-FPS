import * as THREE from "three";
import { Action } from "./actions.js";
import { State } from "./state.js";
import { Player } from "./player.js";

/**
 * @param {State} state
 * @param {Action} action
 */
export function dispatch(state, action) {
    switch (action.type) {
        case "INIT_GAME": {
            const { playerIds } = action.data;

            const state = new State();

            // Add players
            playerIds.forEach(playerId => {
                const player = new Player(playerId);
                state.players.set(player.id, player);
                state.scene.add(player.mesh);
            });

            // Add a floor
            const geometry = new THREE.BoxGeometry(1, 1, 0.1);
            const material = new THREE.MeshBasicMaterial();
            const floor = new THREE.Mesh(geometry, material);
            state.scene.add(floor);

            return state;
        }
        case "SET_SCREEN_SIZE": {
            const { width, height } = action.data;
            state.camera = new THREE.PerspectiveCamera(70, width / height);
            state.camera.position.z = 1;
            return state;
        }
    }
    return state;
}
