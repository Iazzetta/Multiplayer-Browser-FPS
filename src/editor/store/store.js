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
        game_running: false,
        level: {
            /**
             * @type {Entity[]}
             */
            entities: []
        }
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
        ROTATE_ENTITY(state, payload) {
            const { id, x, y, z } = payload;
            const entity = state.level.entities.find(e => e.id === id);
            if (entity) {
                entity.rotation.x = x !== undefined ? x : entity.rotation.x;
                entity.rotation.y = y !== undefined ? y : entity.rotation.y;
                entity.rotation.z = z !== undefined ? z : entity.rotation.z;

                const index = state.level.entities.indexOf(entity);
                const newEntity = new Entity(entity);

                // @ts-ignore
                Vue.set(state.level.entities, index, newEntity);
            }
        },
        DELETE_ENTITY(state, payload) {
            const { id } = payload;
            state.level.entities = state.level.entities.filter(e => {
                return e.id !== id;
            });
        },
        SNAP_ENTITIES_TO_GRID(state, payload) {
            const GRID = 2;
            state.level.entities.forEach(entity => {
                entity.position.x = Math.round(entity.position.x / GRID) * GRID;
                entity.position.y = Math.round(entity.position.y / GRID) * GRID;
                entity.position.z = Math.round(entity.position.z / GRID) * GRID;
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
                    rotation: entity.rotation,
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
        rotateEntity(store, payload) {
            store.commit("ROTATE_ENTITY", payload);
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

        // Apply rotation and compute boundingBox
        mesh.geometry.rotateX(this.rotation.x);
        mesh.geometry.rotateY(this.rotation.y);
        mesh.geometry.rotateZ(this.rotation.z);
        mesh.geometry.computeBoundingBox();

        // Reset rotation
        const size = mesh.geometry.boundingBox.getSize(new Vector3());
        mesh.geometry.rotateX(-this.rotation.x);
        mesh.geometry.rotateY(-this.rotation.y);
        mesh.geometry.rotateZ(-this.rotation.z);

        return size;
    }
}
