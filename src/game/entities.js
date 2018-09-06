import {
    MeshComponent,
    ControllerComponent,
    VelocityComponent
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
         * @type {MeshComponent}
         */
        this.mesh = undefined;

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
        this.controller = new ControllerComponent();
        this.velocity = new VelocityComponent();
        this.mesh = new MeshComponent();
    }
}
