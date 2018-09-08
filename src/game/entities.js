import {
    ControllerComponent,
    VelocityComponent,
    JetpackComponent,
    DecayComponent,
    BodyComponent,
    HeadComponent
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
         * @type {BodyComponent}
         */
        this.body = undefined;

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
        this.body = new BodyComponent();
        this.head = new HeadComponent(this.body);
    }
}

export class Bullet extends Entity {
    /**
     * @param {string} id
     */
    constructor(id) {
        super(id);
        this.decay = new DecayComponent(1000);
        this.velocity = new VelocityComponent();
        this.body = new BodyComponent();
    }
}
