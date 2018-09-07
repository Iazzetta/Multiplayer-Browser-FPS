import * as THREE from "three";
import { Action } from "./actions.js";
import { State } from "./state.js";
import { Player } from "./entities";

/**
 * @param {State} state
 * @param {Action} action
 */
export function dispatch(state, action) {
    switch (action.type) {
        case "INIT_GAME": {
            const { playerIds } = action.data;

            const state = new State();
            state.time.start = Date.now();
            state.playerIds = playerIds;

            // Add players
            playerIds.forEach(playerId => {
                const player = new Player(playerId);
                player.mesh.body.position.y = 0.5;
                state.addEntity(player);
            });

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
            const { mesh } = state.getEntity(playerId);
            if (mesh !== undefined) {
                mesh.body.rotation.y = ver;
                mesh.head.rotation.x = hor;
            }
            return state;
        }
    }
    return state;
}
