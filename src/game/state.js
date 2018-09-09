import * as THREE from "three";
import { Player, Entity } from "./entities.js";
import random from "lodash/random";

export class State {
    constructor() {
        this.time = { start: 0, elapsed: 0, delta: 0 };

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
        this.scene.add(backLight);

        this.scene.add(keyLight);
        this.scene.add(fillLight);
        this.scene.add(backLight)
    }

    /**
     * @param {Entity} entity
     */
    addEntity(entity) {
        if (this.entities.has(entity.id)) {
            this.deleteEntity(entity.id);
        }
        if (entity.body) {
            this.scene.add(entity.body);
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
        if (entity.body) {
            this.scene.remove(entity.body);
        }
        this.entities.delete(id);
    }
}
