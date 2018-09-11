import * as THREE from "three";
import { DEFAULT_BOX, DEFAULT_MATERIAL } from "./assets";

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

export class HealthComponent {
    constructor() {
        this.hp = this.max = 100;
    }
}

export class DamageComponent {
    constructor() {
        this.creatorId = "";
        this.dmg = 5;
    }
}

export class Object3DComponent extends THREE.Object3D {
    constructor() {
        super();
    }
}

export class HeadComponent extends THREE.Object3D {
    /**
     * @param {Object3DComponent} object3D
     */
    constructor(object3D) {
        super();
        this.position.y = 2;
        this.position.z = 0;
        object3D.add(this);
    }

    getFacingDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        const matrix = new THREE.Matrix4();
        matrix.extractRotation(this.matrixWorld);
        return matrix.multiplyVector3(direction);
    }
}
