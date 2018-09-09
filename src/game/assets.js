import * as THREE from "three";

export const [DEFAULT_BOX, DEFAULT_MATERIAL] = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial()
];

export class Assets {
    constructor() {
        /**
         * @type {Map<string,THREE.Group>}
         */
        this.list = new Map();
    }

    /**
     * @param {Promise<[string,THREE.Group]>[]} loadAssets
     * @returns {Promise<Assets>}
     */
    load(loadAssets) {
        return Promise.all(loadAssets).then(data => {
            this.list = new Map(data);
            return this;
        });
    }

    /**
     * @param {string} name
     * @returns {THREE.Group}
     */
    group(name) {
        return this.list.get(name);
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
