import * as THREE from "three";

export const [DEFAULT_BOX, DEFAULT_MATERIAL] = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial()
];

export class ControllerComponent {
    constructor() {
        this.speed = 0.01;
        this.input = {
            forward: false,
            left: false,
            back: false,
            right: false
        };
    }
}

export class VelocityComponent {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}

export class MeshComponent {
    constructor() {
        this.body = new THREE.Mesh(DEFAULT_BOX, DEFAULT_MATERIAL);
        this.head = new THREE.Mesh(DEFAULT_BOX, DEFAULT_MATERIAL);
        this.head.position.y = 1.2;
        this.head.position.z = -0.25;
        this.body.add(this.head);
    }
}
