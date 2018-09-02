import * as THREE from "three";

export class Player {
    /**
     * @param {string} id
     */
    constructor(id) {
        this.id = id;
        this.speed = 0.05;
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

    velocity() {
        const velocity = {
            z: (this.input.forward ? -1 : 0) + (this.input.back ? 1 : 0),
            x: (this.input.left ? -1 : 0) + (this.input.right ? 1 : 0)
        };

        if (velocity.z !== 0 || velocity.x !== 0) {
            let angle = Math.atan2(velocity.x, velocity.z);
            angle = angle > 0 ? angle : angle + 2 * Math.PI;
            angle += this.mesh.rotation.y;

            velocity.z = Math.cos(angle);
            velocity.x = Math.sin(angle);
        }

        return velocity;
    }

    update() {
        const velocity = this.velocity();
        this.mesh.position.z += velocity.z * this.speed;
        this.mesh.position.x += velocity.x * this.speed;
    }
}
