import * as THREE from "three";
import { Player } from "./player.js";

export class State {
    constructor() {
        this.scene = new THREE.Scene();

        /**
         * @type {Map<string,Player>}
         */
        this.players = new Map();

        /**
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = new THREE.PerspectiveCamera(90, 1);

        // Add a floor
        const geometry = new THREE.BoxGeometry(10, 1, 10);
        const material = new THREE.MeshNormalMaterial();
        const floor = new THREE.Mesh(geometry, material);
        floor.position.y = -0.5;
        this.scene.add(floor);
    }
}
