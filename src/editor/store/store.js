import Vue from "vue/dist/vue.esm.js";
import Vuex from "vuex";
import { Game } from "../../client/js/game";
import { Vector3 } from "three";

// @ts-ignore
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        world: {},
        tileset: []
    },
    mutations: {
        ADD_TILE(state, payload) {
            const { name, size } = payload;
            state.tileset.push({ name, size });
        }
    },
    actions: {
        init(store) {
            const game = new Game();
            return game.loadAssets().then(() => {
                const assets = game.state.assets;
                assets.objList.forEach((g, name) => {
                    if (name.indexOf("tile--") !== -1) {
                        const mesh = assets.mesh(name);
                        mesh.geometry.computeBoundingBox();

                        const box = mesh.geometry.boundingBox;
                        const size = box.getSize(new Vector3());
                        store.commit("ADD_TILE", { name, size });
                    }
                });
            });
        }
    }
});
