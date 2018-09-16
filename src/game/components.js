import * as THREE from "three";
import { AABB, createDebugMesh } from "./utils";

export const DEBUG = true;

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
            jump: false,
            shoot: false
        };
    }
}

export class WeaponComponent {
    constructor() {
        this.ammoCount = 30;
        this.firerateTimer = 0;
        this.spec = {
            magazineSize: 30,
            firerate: 100,
            realod: 5000
        };
    }
}

export class VelocityComponent extends THREE.Vector3 {
    constructor() {
        super(0, 0, 0);
    }

    /**
     * @param {number} delta
     */
    getForceVector(delta) {
        return new THREE.Vector3(
            this.x * delta,
            this.y * delta,
            this.z * delta
        );
    }
}

export class ColliderComponent extends THREE.Vector3 {
    constructor() {
        super();
        /**
         * @type {-1 | 0 | 1}
         */
        this.x = 0;

        /**
         * @type {-1 | 0 | 1}
         */
        this.y = 0;

        /**
         * @type {-1 | 0 | 1}
         */
        this.z = 0;
    }

    any() {
        return this.x !== 0 || this.y !== 0 || this.z !== 0;
    }

    bottom() {
        return this.y === 1;
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
    /**
     * @param {THREE.Vector3} radius
     */
    constructor(radius = new THREE.Vector3(1, 1, 1)) {
        super();
        this.radius = radius;
        if (DEBUG) {
            this.add(createDebugMesh(this.radius));
        }
    }

    getAABB() {
        return new AABB(
            new THREE.Vector3(
                this.position.x - this.radius.x,
                this.position.y - this.radius.y,
                this.position.z - this.radius.z
            ),
            new THREE.Vector3(
                this.position.x + this.radius.x,
                this.position.y + this.radius.y,
                this.position.z + this.radius.z
            )
        );
    }
}

export class HeadComponent extends THREE.Object3D {
    constructor() {
        super();
        this.position.y = 2;
        this.position.z = 0;

        if (DEBUG) {
            this.add(createDebugMesh());
        }
    }

    getFacingDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        const matrix = new THREE.Matrix4();
        matrix.extractRotation(this.matrixWorld);
        return direction.applyMatrix4(matrix);
    }
}
