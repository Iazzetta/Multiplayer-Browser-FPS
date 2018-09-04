import * as THREE from "three";
import { Player } from "./player.js";
import random from "lodash/random";

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

        // Create random cubes, for orientation
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        for (let i = 0; i < 500; i++) {
            const box = new THREE.Mesh(boxGeometry, material);
            box.position.y = random(-50, 50);
            box.position.x = random(-50, 50);
            box.position.z = random(-50, 50);
            this.scene.add(box);
        }
    }
}
