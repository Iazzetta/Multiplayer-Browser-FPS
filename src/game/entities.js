import * as THREE from "three";
import { Assets } from "./assets";
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
    AmmoComponent
} from "./components";

export class Entity {
    /**
     * @param {string} id
     */
    constructor(id) {
        /**
         * @readonly
         * @type {string}
         */
        this.id = id;

        /**
         * @type {string[]}
         */
        this.flags = [];

        /**
         * @type {boolean}
         */
        this.gravity = false;

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

        /**
         * @type {AmmoComponent}
         */
        this.ammo = undefined;
    }
}

Entity.empty = Object.freeze(new Entity(undefined));

export class Player extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     */
    constructor(id, assets) {
        super(id);
        this.flags = ["player"];
        this.gravity = true;
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

export class Bullet extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     */
    constructor(id, assets) {
        super(id);
        this.decay = new DecayComponent(1000);
        this.damage = new DamageComponent();
        this.velocity = new VelocityComponent();
        this.collider = new ColliderComponent();
        this.object3D = new Object3DComponent(new THREE.Vector3(0.5, 0.5, 0.5));
        this.object3D.add(assets.mesh("wall_tile"));
    }
}

export class Wall extends Entity {
    /**
     * @param {string} id
     * @param {THREE.Vector3} radius
     * @param {THREE.Mesh} mesh
     */
    constructor(id, radius, mesh) {
        super(id);
        this.flags = ["wall"];
        this.object3D = new Object3DComponent(radius);
        this.object3D.add(mesh);
    }
}

export class JetpackPickup extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     */
    constructor(id, assets) {
        super(id);
        this.flags = ["pickup"];
        this.object3D = new Object3DComponent();
        this.jetpack = new JetpackComponent();
    }
}

export class BulletkPickup extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     */
    constructor(id, assets) {
        super(id);
        this.flags = ["pickup"];
        this.object3D = new Object3DComponent();
        this.object3D.add(assets.mesh("bullet_pickup"));
        this.ammo = new AmmoComponent();
    }
}
