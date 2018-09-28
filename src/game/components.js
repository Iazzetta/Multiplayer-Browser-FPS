import * as THREE from "three";
import { DEBUG, WEAPON_TYPE } from "./consts.js";
import { AABB, createDebugMesh } from "./utils";

export class DecayComponent {
    constructor(ttl = 0) {
        this.ttl = ttl;
    }
}

export class PlayerComponent {
    /**
     * @param {string} id
     * @param {string} name
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.kills = 0;
        this.deaths = 0;
        this.respawnTimer = 0;
    }
}

export class ControllerComponent {
    constructor() {
        /**
         * @type {"idle"|"running"|"shooting"|"reloading"}
         */
        this.state = "idle";
        this.speed = 0.02;
        this.input = {
            forward: false,
            left: false,
            back: false,
            right: false,
            jump: false,
            shoot: false,
            reload: false
        };
    }
}

export class WeaponComponent {
    constructor() {
        this.type = WEAPON_TYPE.MACHINEGUN;
        this.loadedAmmo = this.type.maxLoadedAmmo;
        this.reservedAmmo = this.type.maxReservedAmmo;
        this.firerateTimer = 0;
        this.reloadTimer = 0;
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
        this.position.y = 1.5;
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
