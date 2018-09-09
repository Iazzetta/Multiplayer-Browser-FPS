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
    }
}
