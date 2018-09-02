import * as THREE from "three";

export class Player {
    /**
     * @param {string} id
     */
    constructor(id) {
        this.id = id;

        this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        this.material = new THREE.MeshNormalMaterial();
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.input = {
            forward: false,
            left: false,
            back: false,
            right: false
        };
    }
}
