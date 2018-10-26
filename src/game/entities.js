import * as THREE from "three";
import { Assets } from "./assets";
import { RESPAWN_TIME } from "./consts.js";
import {
    PlayerComponent,
    VelocityComponent,
    Object3DComponent,
    ColliderComponent,
    WeaponComponent,
    StatsComponent,
    PlayerModelComponent,
    TileComponent
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

        /**
         * @type {number}
         */
        this.health = undefined;

        // Components
        //===========================

        /**
         * @type {PlayerComponent}
         */
        this.player = undefined;

        /**
         * @type {PlayerModelComponent}
         */
        this.playerModel = undefined;

        /**
         * @type {TileComponent}
         */
        this.tile = undefined;

        /**
         * @type {StatsComponent}
         */
        this.stats = undefined;

        /**
         * @type {Object3DComponent}
         */
        this.object3D = undefined;

        /**
         * @type {ColliderComponent}
         */
        this.collider = undefined;

        /**
         * @type {VelocityComponent}
         */
        this.velocity = undefined;

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

        this.player = player;
        this.player.respawnTimer = RESPAWN_TIME;
        this.stats = new StatsComponent();

        this.velocity = new VelocityComponent();
        this.object3D = new Object3DComponent();
        this.object3D.rotation.y = 0;

        this.playerModel = new PlayerModelComponent(this.object3D);
        this.playerModel.head.rotation.x = toRadians(-80);
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

        this.player = player;
        this.player.respawnTimer = 0;
        this.stats = new StatsComponent();

        this.health = 100;
        this.weapon = new WeaponComponent();
        this.weapon.loadedAmmo = this.stats.maxLoadedAmmo;
        this.weapon.reservedAmmo = this.stats.maxReservedAmmo;

        this.velocity = new VelocityComponent();
        this.collider = new ColliderComponent();

        this.object3D = new Object3DComponent(new THREE.Vector3(0.5, 1, 0.5));

        this.playerModel = new PlayerModelComponent(this.object3D);

        const weapon = assets.mesh("player_weapon");
        weapon.receiveShadow = true;
        this.playerModel.povWeaponModel.add(weapon);

        const muzzle_flash = assets.mesh("muzzle_flash");
        this.playerModel.povMuzzleflash.add(muzzle_flash);

        const head = assets.mesh("player_head");
        head.castShadow = true;
        this.playerModel.headModel.add(head);

        const body = assets.mesh("player_body");
        body.castShadow = true;
        this.playerModel.bodyModel.add(body);

        this.playerModel.setMode("third-person");
    }
}

export class WallEntity extends Entity {
    /**
     * @param {string} id
     * @param {Assets} assets
     * @param {object} config
     * @param {string} config.tile
     * @param {THREE.Vector3} config.position
     * @param {THREE.Euler} config.rotation
     */
    constructor(id, assets, config) {
        super(id);
        this.sleep = true;
        this.flags = ["wall"];

        const { tile, position, rotation } = config;

        this.tile = new TileComponent(tile, assets);
        this.tile.mesh.castShadow = true;
        this.tile.mesh.receiveShadow = true;
        this.tile.rotation.copy(rotation);

        this.object3D = new Object3DComponent();
        this.object3D.setSize(this.tile.getSize());
        this.object3D.position.copy(position);
        this.object3D.rotation.copy(rotation);
        this.object3D.add(this.tile.mesh);
    }
}
