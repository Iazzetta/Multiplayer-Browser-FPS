import {
    MeshComponent,
    ControllerComponent,
    VelocityComponent,
    JetpackComponent
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
        this.controller = new ControllerComponent();
        this.velocity = new VelocityComponent();
        this.jetpack = new JetpackComponent();
        this.mesh = new MeshComponent();
    }
}

export class Bullet extends Entity {
    /**
     * @param {string} id
     */
    constructor(id) {
        super(id);
        this.velocity = new VelocityComponent();
        this.mesh = new MeshComponent();
    }
}
