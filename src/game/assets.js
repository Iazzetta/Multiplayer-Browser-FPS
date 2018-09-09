import * as THREE from "three";

export const [DEFAULT_BOX, DEFAULT_MATERIAL] = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial()
];

export class Assets {
    constructor() {
        /**
         * @type {THREE.Group}
         */
        this.map1 = null;

        /**
         * @type {THREE.Group}
         */
        this.player_head = null;

        /**
         * @type {THREE.Group}
         */
        this.player_body = null;
    }

    /**
     * @param {Promise<[string,THREE.Group]>[]} loadAssets
     * @returns {Promise<Assets>}
     */
    load(loadAssets) {
        return Promise.all(loadAssets).then(data => {
            Object.keys(this).forEach(key => {
                const [asset] = data
                    .filter(row => row[0] === key)
                    .map(row => row[1]);

                this[key] = asset;

                if (this[key] instanceof THREE.Group === false) {
                    throw new Error(`Asset ${key} not loaded.`);
                }
            });

            return this;
        });
    }

    /**
     * @param {string} name
     * @returns {THREE.Group}
     */
    group(name) {
        return this[name];
    }

    /**
     * @param {string} name
     * @returns {THREE.Mesh}
     */
    mesh(name) {
        const group = this.group(name);
        if (group && group.children[0]) {
            const mesh = group.children[0];
            if (mesh instanceof THREE.Mesh) {
                return new THREE.Mesh(mesh.geometry, mesh.material);
            }
        }
    }
}
