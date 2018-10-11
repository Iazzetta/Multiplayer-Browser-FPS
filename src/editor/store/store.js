import Vue from "vue/dist/vue.esm.js";
import Vuex from "vuex";
import { Game } from "../../client/js/game";
import { counter } from "../../game/utils";
import { Vector3 } from "three";

// @ts-ignore
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        world: {
            entities: []
        },
        tileset: [],
        selected_tile: null,
        selected_entity: null,
        game_running: false
    },
    mutations: {
        TOGGLE_GAME(state, payload) {
            state.game_running = payload;
        },
        ADD_TILE(state, payload) {
            const { name, size } = payload;
            state.tileset.push({ name, size });
        },
        SELECT_TILE(state, payload) {
            state.selected_tile = payload;
        },
        ADD_ENTITY(state, payload) {
            const { id, position, tile } = payload;
            state.world.entities.push({ id, position, tile });
        },
        MOVE_ENTITY(state, payload) {
            const { id, x, y, z } = payload;
            const entity = state.world.entities.find(e => e.id === id);
            if (entity) {
                entity.position.x = x !== undefined ? x : entity.position.x;
                entity.position.y = y !== undefined ? y : entity.position.y;
                entity.position.z = z !== undefined ? z : entity.position.z;
            }
        },
        SELECT_ENTITY(state, payload) {
            const { id } = payload;
            state.selected_entity = id;
        }
    },
    getters: {
        selectedTile(state) {
            const { tileset, selected_tile } = state;
            return tileset.find(tile => tile.name === selected_tile);
        },
        selectedEntity(state) {
            const { world, selected_entity } = state;
            return world.entities.find(entity => entity.id === selected_entity);
        },
        levelExport(state) {
            const json = {
                tiles: []
            };

            state.world.entities.forEach(entity => {
                json.tiles.push({
                    id: entity.id,
                    position: entity.position,
                    size: entity.tile.size,
                    mesh: entity.tile.name
                });
            });

            return JSON.parse(JSON.stringify(json));
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
        },
        addEntity(store, payload) {
            const tile = store.getters.selectedTile;
            if (tile === undefined) {
                return Promise.reject();
            }

            const { x, z, y = tile.size.y * 0.5 } = payload;
            const id = counter("editor-enteties").toString(16);
            const position = new Vector3(x, y, z);
            store.commit("ADD_ENTITY", { id, position, tile });

            const entity = store.state.world.entities.find(e => e.id === id);
            return Promise.resolve(entity);
        }
    }
});
