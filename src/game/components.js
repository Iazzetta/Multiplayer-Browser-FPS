import * as THREE from "three";

export const [DEFAULT_BOX, DEFAULT_MATERIAL] = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial()
];

export class DecayComponent {
    constructor(ttl = 0) {
        this.ttl = ttl;
    }
}

export class ControllerComponent {
    constructor() {
        this.speed = 0.01;
        this.input = {
            forward: false,
            left: false,
            back: false,
            right: false,
            jump: false
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

export class JetpackComponent {
    constructor() {
        this.maxFuel = 2000;
        this.minFuel = -1000;
        this.fuel = this.maxFuel;
    }
}

export class BodyComponent extends THREE.Mesh {
    constructor() {
        super(DEFAULT_BOX, DEFAULT_MATERIAL);
    }
}

export class HeadComponent extends THREE.Mesh {
    /**
     * @param {BodyComponent} body
     */
    constructor(body) {
        super(DEFAULT_BOX, DEFAULT_MATERIAL);
        this.position.y = 1.2;
        this.position.z = -0.25;
        body.add(this);
    }

    getFacingDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        const matrix = new THREE.Matrix4();
        matrix.extractRotation(this.matrixWorld);
        return matrix.multiplyVector3(direction);
    }
}
