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
            down: false,
            shoot: false,
            reload: false
        };

        this.prevInput = Object.assign({}, this.input);
    }

    pressed(input) {
        return this.input[input] && !this.prevInput[input];
    }

    released(input) {
        return !this.input[input] && this.prevInput[input];
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
        this.accuracy = 0.9;
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
     * @param {Object3DComponent} object3D
     */
    constructor(object3D) {
        super();

        const size = object3D.toAABB().size();

        this.root = new THREE.Object3D();
        this.root.position.y = -size.y * 0.3;
        object3D.add(this.root);

        this.body = new THREE.Object3D();
        this.body.position.y = size.y * 0.5;
        this.root.add(this.body);

        this.head = new THREE.Object3D();
        this.head.position.y = size.y * 0.5;
        this.root.add(this.head);

        this.bodyModel = new THREE.Object3D();
        this.body.add(this.bodyModel);

        this.headModel = new THREE.Object3D();
        this.head.add(this.headModel);

        this.camera = new THREE.PerspectiveCamera(90, 1);
        this.camera.position.y = 0.25;
        this.head.add(this.camera);

        this.povMuzzleflash = new THREE.Object3D();
        this.povWeaponModel = new THREE.Object3D();
        this.povWeaponModel.add(this.povMuzzleflash);
        this.camera.add(this.povWeaponModel);
    }

    /**
     *
     * @param {"third-person"|"first-perosn"} mode
     */
    setMode(mode) {
        switch (mode) {
            case "first-perosn": {
                this.povWeaponModel.visible = true;
                this.headModel.visible = false;
                this.bodyModel.visible = false;
                return;
            }
            case "third-person": {
                this.povWeaponModel.visible = false;
                this.headModel.visible = true;
                this.bodyModel.visible = true;
                return;
            }
        }
    }
}
