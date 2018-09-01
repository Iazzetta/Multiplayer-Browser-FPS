import * as THREE from "three";

export class Game {
    constructor() {
        this.scene = new THREE.Scene();

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

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
