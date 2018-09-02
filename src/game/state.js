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
        this.camera = new THREE.PerspectiveCamera(70, 1);
        this.camera.position.z = 0.3;
        this.camera.rotation.x = (90 * Math.PI) / 180;
    }
}
