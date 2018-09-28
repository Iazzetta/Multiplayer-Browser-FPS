import * as THREE from "three";
import { Assets } from "./assets";
import { TILE_SIZE } from "./consts.js";
import {
    ControllerComponent,
    VelocityComponent,
    JetpackComponent,
    DecayComponent,
    Object3DComponent,
    HeadComponent,
    DamageComponent,
    HealthComponent,
    ColliderComponent,
    WeaponComponent,
    PlayerComponent
} from "./components";
import { toRadians } from "./utils";

export class Entity {
    /**
     * @param {string} id
     */
    constructor(id) {
        // Non-component properties
        //===========================

        /**
         * @readonly
         * @type {string}
         */
        this.id = id;

        /**
         * Don't run system updates
         * @type {boolean}
         */
        this.sleep = false;

        /**
         * @type {string[]}
         */
        this.flags = [];

        // Single-value components
        //===========================

        /**
         * @type {string}
         */
        this.name = undefined;

        /**
         * @type {boolean}
         */
        this.gravity = false;

        /**
         * @type {number}
         */
        this.pickupAmmo = undefined;

        /**
         * @type {number}
         */
        this.pickupHp = undefined;

        // Components
        //===========================

        /**
         * @type {PlayerComponent}
         */
        this.player = undefined;

        /**
         * @type {Object3DComponent}
         */
        this.object3D = undefined;

        /**
         * @type {HeadComponent}
         */
        this.head = undefined;

        /**
         * @type {DecayComponent}
         */
        this.decay = undefined;

        /**
         * @type {JetpackComponent}
         */
        this.jetpack = undefined;

        /**
         * @type {ColliderComponent}
         */
        this.collider = undefined;

        /**
         * @type {ControllerComponent}
         */
        this.controller = undefined;

        /**
         * @type {VelocityComponent}
         */
        this.velocity = undefined;

        /**
         * @type {DamageComponent}
         */
        this.damage = undefined;

        /**
         * @type {HealthComponent}
         */
        this.health = undefined;

        /**
         * @type {WeaponComponent}
         */
        this.weapon = undefined;
    }
}

Entity.empty = Object.freeze(new Entity(undefined));

export class PlayerGhostEntity extends Entity {
    /**
     * @param {string} id
     * @param {string} name
     */
    constructor(id, name) {
        super(id);
        this.flags = ["player"];
        this.gravity = false;
        this.player = new PlayerComponent(id, name);
        this.controller = new ControllerComponent();
        this.velocity = new VelocityComponent();

        this.object3D = new Object3DComponent(new THREE.Vector3(1, 2, 1));
        this.object3D.visible = false;
        this.object3D.position.y = 4.5 * TILE_SIZE;

        this.head = new HeadComponent();
        this.object3D.add(this.head);
    }
}

export class PlayerEntity extends Entity {
    /**
     * @param {string} id
     * @param {string} name
     * @param {Assets} assets
     */
    constructor(id, name, assets) {
        super(id);
        this.flags = ["player"];
        this.gravity = true;
        this.player = new PlayerComponent(id, name);
        this.weapon = new WeaponComponent();
        this.health = new HealthComponent();
        this.controller = new ControllerComponent();
        this.velocity = new VelocityComponent();
        this.collider = new ColliderComponent();

        this.head = new HeadComponent();
        this.head.add(assets.mesh("player_head"));

        this.object3D = new Object3DComponent(new THREE.Vector3(1, 2, 1));
        this.object3D.add(assets.mesh("player_body"));
        this.object3D.add(this.head);
    }
}

export class BulletEntity extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     */
    constructor(id, assets) {
        super(id);
        this.decay = new DecayComponent(10000);
        this.damage = new DamageComponent();
        this.velocity = new VelocityComponent();
        this.collider = new ColliderComponent();
        this.object3D = new Object3DComponent(new THREE.Vector3(0.5, 0.5, 0.5));
        this.object3D.add(assets.mesh("bullet"));
    }
}

export class WallEntity extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     */
    constructor(id, assets) {
        const radius = new THREE.Vector3(
            TILE_SIZE * 0.5,
            TILE_SIZE * 0.5,
            TILE_SIZE * 0.5
        );
        const mesh = assets.mesh("wall_tile");
        mesh.scale.set(TILE_SIZE, TILE_SIZE, TILE_SIZE);

        super(id);
        this.sleep = true;
        this.flags = ["wall"];
        this.object3D = new Object3DComponent(radius);
        this.object3D.add(mesh);
    }
}

export class JetpackPickupEntity extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     */
    constructor(id, assets) {
        super(id);
        this.flags = ["pickup"];
        this.gravity = true;
        this.velocity = new VelocityComponent();
        this.collider = new ColliderComponent();
        this.jetpack = new JetpackComponent();
        this.object3D = new Object3DComponent();
        this.object3D.add(assets.mesh("jetpack_pickup"));
    }
}

export class AmmoPickupEntity extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     */
    constructor(id, assets) {
        super(id);
        this.flags = ["pickup"];
        this.pickupAmmo = 30;
        this.gravity = true;
        this.velocity = new VelocityComponent();
        this.collider = new ColliderComponent();
        this.object3D = new Object3DComponent();
        this.object3D.add(assets.mesh("bullet_pickup"));
    }
}

export class HpPickupEntity extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     */
    constructor(id, assets) {
        super(id);
        this.flags = ["pickup"];
        this.gravity = true;
        this.pickupHp = 10;
        this.velocity = new VelocityComponent();
        this.collider = new ColliderComponent();
        this.object3D = new Object3DComponent();
        this.object3D.add(assets.mesh("hp_pickup"));
    }
}
