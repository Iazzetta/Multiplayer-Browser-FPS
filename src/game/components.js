import * as THREE from "three";
import { DEBUG, WEAPON_TYPE } from "./consts.js";
import { AABB, createDebugMesh } from "./utils";

export class PlayerComponent {
    /**
     * @param {object} client
     * @param {string} client.id
     * @param {string} client.name
     */
    constructor(client) {
        this.id = client.id;
        this.name = client.name;
        this.kills = 0;
        this.deaths = 0;

        /**
         * @type {"idle"|"running"|"shooting"|"reloading"|"dead"}
         */
        this.state = "dead";
        this.respawnTimer = 0;

        this.input = {
            mouseX: 0,
            mouseY: 0,
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

    toAABB() {
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
