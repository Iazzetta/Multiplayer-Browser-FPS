import * as THREE from "three";
import { Player, Entity } from "./entities.js";
import { Assets } from "./assets.js";

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
    }

    /**
     * @param {Entity} entity
     */
    addEntity(entity) {
        if (this.entities.has(entity.id)) {
            this.deleteEntity(entity.id);
        }
        if (entity.mesh) {
            this.scene.add(entity.mesh);
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
        if (entity.mesh) {
            this.scene.remove(entity.mesh);
        }
        this.entities.delete(id);
    }
}
