import * as THREE from "three";
import { Action } from "./actions.js";
import { Player } from "./player.js";

export class Game {
    constructor() {
        this.scene = new THREE.Scene();

        /**
         * @type {Map<string,Player>}
         */
        this.players = new Map();

        /**
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = null;

        /**
         * @type {THREE.WebGLRenderer}
         */
        this.renderer = null;
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.01,
            10
        );
        this.camera.position.z = 1;
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.innerHTML = "";
        document.body.appendChild(this.renderer.domElement);
    }

    handleResize() {
        window.addEventListener("resize", () => {
            if (this.renderer !== null) {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }

            if (this.camera !== null) {
                this.camera.aspect = window.innerWidth / window.innerHeight;
            }
        });
    }

    /**
     * @param {Action} action
     */
    dispatch(action) {
        switch (action.type) {
            case "ADD_PLAYER": {
                const { playerId } = action.data;
                const player = new Player(playerId);
                this.players.set(player.id, player);
                this.scene.add(player.mesh);
            }
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
