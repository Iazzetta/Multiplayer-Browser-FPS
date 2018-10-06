import * as THREE from "three";
import { DEBUG, RUN_SPEED, JUMP_SPEED } from "./consts.js";
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

export class StatsComponent {
    constructor() {
        // General stats
        this.maxHealth = 100;
        this.runSpeed = RUN_SPEED;
        this.jumpSpeed = JUMP_SPEED;

        // Weapon stats
        this.damage = 1;
        this.firerate = 100;
        this.reloadSpeed = 2000;
        this.maxLoadedAmmo = 50;
        this.maxReservedAmmo = 2500;
    }
}

export class WeaponComponent {
    constructor() {
        this.loadedAmmo = 0;
        this.reservedAmmo = 0;
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

export class PlayerModelComponent extends THREE.Object3D {
    /**
     * @param {object} config
     * @param {THREE.Mesh=} config.headMesh
     * @param {THREE.Mesh=} config.bodyMesh
     */
    constructor(config = {}) {
        super();

        this.headMesh = config.headMesh || new THREE.Mesh();
        this.bodyMesh = config.bodyMesh || new THREE.Mesh();

        this.head = new THREE.Object3D();
        this.head.add(this.headMesh);

        this.body = new THREE.Object3D();
        this.body.add(this.bodyMesh);

        this.headOrigin = new THREE.Object3D();
        this.headOrigin.position.set(0, 1.5, 0);

        this.headOrigin.add(this.head);
        this.body.add(this.headOrigin);
        this.add(this.body);
    }
}
