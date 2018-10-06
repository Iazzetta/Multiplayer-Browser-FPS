import * as THREE from "three";
import { Entity } from "./entities.js";
import { Assets } from "./assets.js";

export class State {
    /**
     * @param {State=} prev
     */
    constructor(prev) {
        this.time = { start: Date.now(), elapsed: 0, delta: 0 };

        /**
         * @type {string}
         */
        this.playerId = prev ? prev.playerId : "player-1";

        /**
         * @type {string}
         */
        this.povEntity = null;

        /**
         * @type {Assets}
         */
        this.assets = prev ? prev.assets : new Assets();

        /**
         * @type {THREE.Scene}
         */
        this.scene = new THREE.Scene();

        /**
         * @type {THREE.Vector3[]}
         */
        this.playerSpawns = [];

        /**
         * @private
         * @type {Map<string,Entity>}
         */
        this._entities = new Map();

        /**
         * @private
         * @type {Map<string,Entity[]>}
         */
        this._entityGroups = new Map();

        /**
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = new THREE.PerspectiveCamera(90, 1);
        this.screenWidth = prev ? prev.screenWidth : 1;
        this.screenHeight = prev ? prev.screenHeight : 1;
        this.setCameraSize(this.screenWidth, this.screenHeight);

        // Create lights ...
        const dirLight = (color, int) => {
            return new THREE.DirectionalLight(new THREE.Color(color), int);
        };

        var light = new THREE.AmbientLight(0x404040);
        this.scene.add(light);

        const keyLight = dirLight("#FFE4C4", 0.74);
        keyLight.position.set(-100, 50, 100);
        this.scene.add(keyLight);

        const fillLight = dirLight("#A6D8ED", 0.25);
        fillLight.position.set(100, 50, 100);
        this.scene.add(fillLight);

        const backLight = dirLight("#FFFFFF", 0.5);
        backLight.position.set(100, 0, -100).normalize();
        this.scene.add(backLight);
    }

    /**
     * @param {string} id
     */
    setPovEntity(id) {
        const povEntity = this.getEntity(id);
        const prevPovEntity = this.getEntity(this.povEntity);

        const show = obj => (obj.visible = true);
        const hide = obj => (obj.visible = false);

        if (prevPovEntity) {
            const { pov, playerModel } = prevPovEntity;
            if (playerModel) {
                playerModel.head.children.forEach(show);
                playerModel.body.children.forEach(show);
            }

            if (pov) {
                pov.visible = false;
                pov.weapon.remove(...pov.weapon.children);
            }
        }

        if (povEntity) {
            const { pov, playerModel, weapon } = povEntity;
            if (playerModel) {
                playerModel.head.children.forEach(hide);
                playerModel.body.children.forEach(hide);
            }

            if (pov) {
                pov.visible = true;
                if (weapon) {
                    pov.weapon.add(this.assets.mesh("player_weapon"));
                }

                this.camera = pov.camera;
                this.setCameraSize(this.screenWidth, this.screenHeight);
            }
        }
    }

    /**
     * @param {number} width
     * @param {number} height
     */
    setCameraSize(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * @param {Entity} entity
     */
    addEntity(entity) {
        if (this._entities.has(entity.id)) {
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
        this._entities.set(entity.id, entity);

        if (this.playerId === entity.id) {
            this.setPovEntity(entity.id);
        }
    }

    /**
     * @param {string} id
     * @returns {Entity}
     */
    getEntity(id) {
        return this._entities.get(id);
    }

    /**
     * for more convenient destructing ...
     *
     * @param {string} id
     * @returns {Entity}
     */
    getEntityComponents(id) {
        return this._entities.get(id) || Entity.empty;
    }

    /**
     * @param {string} flag
     */
    getEntityGroup(flag) {
        if (!this._entityGroups.has(flag)) {
            this._entityGroups.set(flag, []);
        }
        return this._entityGroups.get(flag);
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
            this._entities.delete(id);
        }
    }

    /**
     * @param {(entity:Entity) => any} f
     */
    forEachEntity(f) {
        this._entities.forEach(f);
    }
}
