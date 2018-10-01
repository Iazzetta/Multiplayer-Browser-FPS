import * as THREE from "three";
import { Assets } from "./assets";
import { TILE_SIZE, RESPAWN_TIME } from "./consts.js";
import {
    PlayerComponent,
    VelocityComponent,
    Object3DComponent,
    HeadComponent,
    HealthComponent,
    ColliderComponent,
    WeaponComponent
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
         * @type {boolean}
         */
        this.gravity = false;

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
         * @type {ColliderComponent}
         */
        this.collider = undefined;

        /**
         * @type {VelocityComponent}
         */
        this.velocity = undefined;

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
     * @param {PlayerComponent} player
     */
    constructor(player) {
        super(player.id);
        this.flags = ["player"];
        this.gravity = false;

        this.player = new PlayerComponent(player);
        this.player.respawnTimer = RESPAWN_TIME;

        this.velocity = new VelocityComponent();
        this.object3D = new Object3DComponent(new THREE.Vector3(1, 2, 1));
        this.object3D.visible = false;
        this.object3D.position.y = 4.5 * TILE_SIZE;
        this.head = new HeadComponent();
        this.head.rotation.x = toRadians(-80);
        this.object3D.add(this.head);
    }
}

export class PlayerEntity extends Entity {
    /**
     * @param {PlayerComponent} player
     * @param {Assets} assets
     */
    constructor(player, assets) {
        super(player.id);
        this.flags = ["player"];
        this.gravity = true;

        this.player = new PlayerComponent(player);
        this.player.respawnTimer = 0;

        this.weapon = new WeaponComponent();
        this.health = new HealthComponent();

        this.velocity = new VelocityComponent();
        this.collider = new ColliderComponent();

        this.head = new HeadComponent();
        this.head.add(assets.mesh("player_head"));

        this.object3D = new Object3DComponent(new THREE.Vector3(1, 2, 1));
        this.object3D.add(assets.mesh("player_body"));
        this.object3D.add(this.head);
    }
}

export class WallEntity extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     * @param {THREE.Vector3} size
     */
    constructor(id, assets, size) {
        const radius = new THREE.Vector3(
            size.x * 0.5,
            size.y * 0.5,
            size.z * 0.5
        );

        super(id);
        this.sleep = true;
        this.flags = ["wall"];
        this.object3D = new Object3DComponent(radius);

        const mesh = assets.mesh("wall_tile");
        mesh.scale.copy(size);
        this.object3D.add(mesh);
    }
}
