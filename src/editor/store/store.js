import Vue from "vue/dist/vue.esm.js";
import Vuex from "vuex";
import { Game } from "../../client/js/game";
import { counter } from "../../game/utils";
import { Vector3 } from "three";

// @ts-ignore
Vue.use(Vuex);

export const game = new Game();

export default new Vuex.Store({
    state: {
        tileset: [],
        selected_tile: null,
        level: {
            entities: []
        },
        game_running: false
    },
    mutations: {
        SET_TILESET(state, payload) {
            const { tileset } = payload;
            state.tileset = tileset;
        },
        SELECT_TILE(state, payload) {
            const { tile } = payload;
            state.selected_tile = tile;
        },
        ADD_ENTITY(state, payload) {
            const { entity } = payload;
            state.level.entities.push(entity);
        },
        TOGGLE_ENTITY(state, payload) {
            const { id, selected } = payload;
            const entity = state.level.entities.find(e => e.id === id);
            if (entity) {
                entity.selected = selected;
            }
        },
        MOVE_ENTITY(state, payload) {
            const { id, x, y, z } = payload;
            const entity = state.level.entities.find(e => e.id === id);
            if (entity) {
                entity.position.x = x !== undefined ? x : entity.position.x;
                entity.position.y = y !== undefined ? y : entity.position.y;
                entity.position.z = z !== undefined ? z : entity.position.z;
            }
        },
        DELETE_ENTITY(state, payload) {
            const { id } = payload;
            state.level.entities = state.level.entities.filter(e => {
                return e.id !== id;
            });
        },
        TOGGLE_GAME(state, payload) {
            state.game_running = payload;
        }
    },
    getters: {
        tileset(state) {
            const selected = state.selected_tile;
            return state.tileset.map(name => ({
                name,
                selected: name === selected
            }));
        },
        selectedTile(state) {
            return state.selected_tile;
        },
        entities(state) {
            return state.level.entities;
        },
        levelExport(state) {
            const json = {
                tiles: []
            };

            state.level.entities.forEach(entity => {
                json.tiles.push({
                    id: entity.id,
                    position: entity.position,
                    size: entity.size,
                    mesh: entity.tile
                });
            });

            return JSON.parse(JSON.stringify(json));
        }
    },
    actions: {
        load(store) {
            return game.loadAssets().then(() => {
                const tileset = [];
                const assets = game.state.assets;
                assets.objList.forEach((g, name) => {
                    if (name.indexOf("tile--") !== -1) {
                        tileset.push(name);
                    }
                });
                store.commit("SET_TILESET", { tileset });
            });
        },
        selectTile(store, payload) {
            const { tile } = payload;
            store.commit("SELECT_TILE", { tile });
        },
        addEntity(store, payload) {
            const { tile, x, y, z } = payload;
            const entity = new Entity({
                id: (counter("editor-entity") + 128).toString(16),
                tile,
                position: new Vector3(),
                rotation: new Vector3(),
                selected: false
            });

            store.commit("ADD_ENTITY", { entity });
            store.commit("MOVE_ENTITY", { id: entity.id, x, y, z });

            return entity;
        },
        selectEntity(store, payload) {
            const { id } = payload;
            store.commit("TOGGLE_ENTITY", { id, selected: true });
        },
        deselectEntity(store, payload) {
            const { id } = payload;
            store.commit("TOGGLE_ENTITY", { id, selected: false });
        },
        deselectEntityAll(store) {
            store.getters.entities
                .filter(entity => entity.selected)
                .map(entity => entity.id)
                .forEach(id => {
                    store.commit("TOGGLE_ENTITY", { id, selected: false });
                });
        },
        moveEntity(store, payload) {
            store.commit("MOVE_ENTITY", payload);
        },
        deleteEntity(store, payload) {
            store.commit("DELETE_ENTITY", payload);
        },
        deleteSelectedEntity(store) {
            store.getters.entities
                .filter(entity => entity.selected)
                .map(entity => entity.id)
                .forEach(id => {
                    store.commit("DELETE_ENTITY", { id });
                });
        }
    }
});

export class Entity {
    /**
     * @param {object} entity
     * @param {string} entity.id
     * @param {string} entity.tile
     * @param {Vector3} entity.position
     * @param {Vector3} entity.rotation
     * @param {boolean} entity.selected
     */
    constructor(entity) {
        this.id = entity.id;
        this.tile = entity.tile;
        this.position = entity.position;
        this.rotation = entity.rotation;
        this.selected = entity.selected;
        this.size = this.getSize();
    }

    getSize() {
        const mesh = game.state.assets.mesh(this.tile);
        mesh.geometry.computeBoundingBox();
        return mesh.geometry.boundingBox.getSize(new Vector3());
    }
}

// export default new Vuex.Store({
//     state: {
//         world: {
//             entities: []
//         },
//         tileset: [],
//         selected_tile: null,
//         selected_entity: null,
//         game_running: false
//     },
//     mutations: {
//         TOGGLE_GAME(state, payload) {
//             state.game_running = payload;
//         },
//         ADD_TILE(state, payload) {
//             const { name, size } = payload;
//             state.tileset.push({ name, size });
//         },
//         SELECT_TILE(state, payload) {
//             state.selected_tile = payload;
//         },
//         ADD_ENTITY(state, payload) {
//             const { id, position, tile } = payload;
//             state.world.entities.push({ id, position, tile });
//         },
//         MOVE_ENTITY(state, payload) {
//             const { id, x, y, z } = payload;
//             const entity = state.world.entities.find(e => e.id === id);
//             if (entity) {
//                 entity.position.x = x !== undefined ? x : entity.position.x;
//                 entity.position.y = y !== undefined ? y : entity.position.y;
//                 entity.position.z = z !== undefined ? z : entity.position.z;
//             }
//         },
//         SELECT_ENTITY(state, payload) {
//             const { id } = payload;
//             state.selected_entity = id;
//         },
//         DELETE_ENTITY(state, payload) {
//             const { id } = payload;
//             state.world.entities = state.world.entities.filter(e => {
//                 return e.id !== id;
//             });
//         }
//     },
//     getters: {
//         selectedTile(state) {
//             const { tileset, selected_tile } = state;
//             return tileset.find(tile => tile.name === selected_tile);
//         },
//         selectedEntity(state) {
//             const { world, selected_entity } = state;
//             return world.entities.find(entity => entity.id === selected_entity);
//         },
//         levelExport(state) {
//             const json = {
//                 tiles: []
//             };

//             state.world.entities.forEach(entity => {
//                 json.tiles.push({
//                     id: entity.id,
//                     position: entity.position,
//                     size: entity.tile.size,
//                     mesh: entity.tile.name
//                 });
//             });

//             return JSON.parse(JSON.stringify(json));
//         }
//     },
//     actions: {
//         init(store) {
//             const game = new Game();
//             return game.loadAssets().then(() => {
//                 const assets = game.state.assets;
//                 assets.objList.forEach((g, name) => {
//                     if (name.indexOf("tile--") !== -1) {
//                         const mesh = assets.mesh(name);
//                         mesh.geometry.computeBoundingBox();

//                         const box = mesh.geometry.boundingBox;
//                         const size = box.getSize(new Vector3());
//                         store.commit("ADD_TILE", { name, size });
//                     }
//                 });
//             });
//         },
//         addEntity(store, payload) {
//             const tile = store.getters.selectedTile;
//             if (tile === undefined) {
//                 return Promise.reject();
//             }

//             const { x, z, y = tile.size.y * 0.5 } = payload;
//             const id = counter("editor-enteties").toString(16);
//             const position = new Vector3(x, y, z);
//             store.commit("ADD_ENTITY", { id, position, tile });

//             const entity = store.state.world.entities.find(e => e.id === id);
//             return Promise.resolve(entity);
//         }
//     }
// });
