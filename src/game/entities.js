import { MeshComponent, ControllerComponent } from "./components";

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
        this.constroller = undefined;
    }
}

Entity.empty = Object.freeze(new Entity(undefined));

export class Player extends Entity {
    /**
     * @param {string} id
     */
    constructor(id) {
        super(id);
        this.constroller = new ControllerComponent();
        this.mesh = new MeshComponent();
    }

    // velocity() {
    //     const velocity = {
    //         z: (this.input.forward ? -1 : 0) + (this.input.back ? 1 : 0),
    //         x: (this.input.left ? -1 : 0) + (this.input.right ? 1 : 0)
    //     };

    //     if (velocity.z !== 0 || velocity.x !== 0) {
    //         let angle = Math.atan2(velocity.x, velocity.z);
    //         angle = angle > 0 ? angle : angle + 2 * Math.PI;
    //         angle += this.mesh.rotation.y;

    //         velocity.z = Math.cos(angle);
    //         velocity.x = Math.sin(angle);
    //     }

    //     return velocity;
    // }

    // update() {
    //     const velocity = this.velocity();
    //     this.mesh.position.z += velocity.z * this.speed;
    //     this.mesh.position.x += velocity.x * this.speed;
    // }
}
