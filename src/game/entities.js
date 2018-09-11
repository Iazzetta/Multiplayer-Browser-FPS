import * as THREE from "three";
import { Assets, DEFAULT_BOX, DEFAULT_MATERIAL } from "./assets";
import {
    ControllerComponent,
    VelocityComponent,
    JetpackComponent,
    DecayComponent,
    Object3DComponent,
    HeadComponent,
    DamageComponent,
    HealthComponent
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
         * @type {boolean}
         */
        this.gravity = false;

        /**
         * @type {boolean}
         */
        this.platform = false;

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
    }

    /**
     * @param {Assets} assets
     */
    setAssets(assets) {}
}

Entity.empty = Object.freeze(new Entity(undefined));

export class Player extends Entity {
    /**
     * @param {string} id
     */
    constructor(id) {
        super(id);
        this.gravity = true;
        this.health = new HealthComponent();
        this.controller = new ControllerComponent();
        this.velocity = new VelocityComponent();
        this.jetpack = new JetpackComponent();
        this.object3D = new Object3DComponent();
        this.head = new HeadComponent(this.object3D);
    }

    /**
     * @param {Assets} assets
     */
    setAssets(assets) {
        this.head.add(assets.mesh("player_head"));
        this.object3D.add(assets.mesh("player_body"));
    }
}

export class Bullet extends Entity {
    /**
     * @param {string} id
     */
    constructor(id) {
        super(id);
        this.decay = new DecayComponent(1000);
        this.damage = new DamageComponent();
        this.velocity = new VelocityComponent();
        this.object3D = new Object3DComponent();
        this.object3D.add(new THREE.Mesh(DEFAULT_BOX, DEFAULT_MATERIAL));
    }
}

export class Platform extends Entity {
    /**
     * @param {string} id
     */
    constructor(id) {
        super(id);
        this.platform = true;
        this.object3D = new Object3DComponent();
    }
}
