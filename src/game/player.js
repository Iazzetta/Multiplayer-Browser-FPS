import * as THREE from "three";

export class Player {
    /**
     * @param {string} id
     */
    constructor(id) {
        this.id = id;
        this.speed = 0.01;
        this.input = {
            forward: false,
            left: false,
            back: false,
            right: false
        };

        // Mesha data
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshNormalMaterial();
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.head = new THREE.Mesh(this.geometry, this.material);
        this.head.position.y = 1.2;
        this.mesh.add(this.head);
    }

    /**
     * @param {number} elapsed
     */
    update(elapsed) {
        if (this.input.forward) {
            this.mesh.position.z -= this.speed;
        }

        if (this.input.back) {
            this.mesh.position.z += this.speed;
        }

        if (this.input.right) {
            this.mesh.position.x += this.speed;
        }

        if (this.input.left) {
            this.mesh.position.x -= this.speed;
        }
    }
}
