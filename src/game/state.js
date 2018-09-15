import * as THREE from "three";
import { Player, Entity, Wall } from "./entities.js";
import { Assets } from "./assets.js";
import memoize from "lodash/memoize";

export class State {
    /**
     *
     * @param {Assets} assets
     */
    constructor(assets) {
        this.time = { start: 0, elapsed: 0, delta: 0 };

        /**
         * @type {Assets}
         */
        this.assets = assets;

        /**
         * @type {THREE.Scene}
         */
        this.scene = new THREE.Scene();

        /**
         * @type {string[]}
         */
        this.playerIds = [];

        /**
         * @type {Map<string,Player>}
         */
        this.entities = new Map();

        /**
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = new THREE.PerspectiveCamera(90, 1);

        this.level = {
            tiles: [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        };
    }

    /**
     * @param {Entity} entity
     */
    addEntity(entity) {
        if (this.entities.has(entity.id)) {
            this.deleteEntity(entity.id);
        }
        if (entity.object3D) {
            this.scene.add(entity.object3D);
        }
        this.entities.set(entity.id, entity);
    }

    /**
     * @param {string} id
     * @returns {Entity}
     */
    getEntity(id) {
        return this.entities.get(id) || Entity.empty;
    }

    /**
     * @param {string} id
     */
    deleteEntity(id) {
        const entity = this.getEntity(id);
        if (entity.object3D) {
            this.scene.remove(entity.object3D);
        }
        this.entities.delete(id);
    }

    /**
     * @param {(tile:Wall)=>any} f
     */
    forEachWallEntity(f) {
        const tiles = this.level.tiles;
        for (let r = 0; r < tiles.length; r++) {
            const row = tiles[r];
            for (let c = 0; c < row.length; c++) {
                const tileId = row[c];
                if (tileId > 0) {
                    const wallId = ["wall", r, c].join("-");
                    const wall = this.getEntity(wallId);
                    f(wall);
                }
            }
        }
    }
}
