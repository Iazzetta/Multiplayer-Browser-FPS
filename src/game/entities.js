import * as THREE from "three";
import { Assets, DEFAULT_BOX, DEFAULT_MATERIAL } from "./assets";
import {
    ControllerComponent,
    VelocityComponent,
    JetpackComponent,
    DecayComponent,
    MeshComponent,
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
         * @type {MeshComponent}
         */
        this.mesh = undefined;

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
        this.mesh = new MeshComponent();
        this.mesh.add(new THREE.Mesh(DEFAULT_BOX, DEFAULT_MATERIAL));
        this.head = new HeadComponent(this.mesh);
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
        this.mesh = new MeshComponent();
        this.mesh.add(new THREE.Mesh(DEFAULT_BOX, DEFAULT_MATERIAL));
    }
}

export class Platform extends Entity {
    /**
     * @param {string} id
     */
    constructor(id) {
        super(id);
        this.mesh = new MeshComponent();
    }
}
