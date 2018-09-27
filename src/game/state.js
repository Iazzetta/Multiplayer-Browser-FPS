import * as THREE from "three";
import { Player, Entity, Wall } from "./entities.js";
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
         * @typedef {{ id:string, name:string, alive:boolean }} PlayerData
         * @type {PlayerData[]}
         */
        this.players = [];

        /**
         * @type {THREE.Vector3[]}
         */
        this.playerSpawns = [];

        /**
         * @type {Map<string,Entity>}
         */
        this.entities = new Map();

        /**
         * @type {Map<string,Entity[]>}
         */
        this.entityGroups = new Map();

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
        if (entity.object3D) {
            this.scene.add(entity.object3D);
        }
        for (let i = 0; i < entity.flags.length; i++) {
            const flag = entity.flags[i];
            const flaggedEntities = this.getEntityGroup(flag);
            flaggedEntities.push(entity);
        }
        this.entities.set(entity.id, entity);
    }

    /**
     * @param {string} id
     * @returns {Entity}
     */
    getEntity(id) {
        return this.entities.get(id);
    }

    /**
     * for more convenient destructing ...
     *
     * @param {string} id
     * @returns {Entity}
     */
    getEntityComponents(id) {
        return this.entities.get(id) || Entity.empty;
    }

    /**
     * @param {string} flag
     */
    getEntityGroup(flag) {
        if (!this.entityGroups.has(flag)) {
            this.entityGroups.set(flag, []);
        }
        return this.entityGroups.get(flag);
    }

    /**
     * @param {string} id
     */
    deleteEntity(id) {
        const entity = this.getEntity(id);
        if (entity !== undefined) {
            if (entity.object3D) {
                this.scene.remove(entity.object3D);
            }
            for (let i = 0; i < entity.flags.length; i++) {
                const flag = entity.flags[i];
                const flaggedEntities = this.getEntityGroup(flag);
                const index = flaggedEntities.indexOf(entity);
                flaggedEntities.splice(index, 1);
            }
            this.entities.delete(id);
        }
    }
}
