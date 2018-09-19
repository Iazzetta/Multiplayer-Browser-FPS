import * as THREE from "three";
import MTLLoader from "three-mtl-loader";
import OBJLoader from "three-obj-loader";
MTLLoader(THREE);
OBJLoader(THREE);

export class Assets {
    constructor() {
        /**
         * @type {Map<string,HTMLImageElement>}
         */
        this.imgList = new Map();

        /**
         * @type {Promise<HTMLImageElement>[]}
         */
        this.imgPromiseList = [];

        /**
         * @type {Map<string,THREE.Group>}
         */
        this.objList = new Map();

        /**
         * @type {Promise<THREE.Group>[]}
         */
        this.objPromiseList = [];

        /**
         * @type {THREE.OBJLoader}
         */
        this.objLoader = new THREE.OBJLoader();

        /**
         * @type {MTLLoader}
         */
        this.mtlLoader = new MTLLoader();

        this.fallback = {
            image: createDefaultImage(),
            geometry: new THREE.BoxGeometry(1, 1, 1),
            material: new THREE.MeshNormalMaterial()
        };
    }

    /**
     * @param {string} name
     * @param {string} src
     */
    loadImg(name, src) {
        this.imgPromiseList.push(
            new Promise(resolve => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    this.imgList.set(name, img);
                    resolve(img);
                };
            })
        );
    }

    /**
     * @param {string} name
     * @param {string} src
     */
    loadObj(name, src) {
        this.objPromiseList.push(
            new Promise(resolve => {
                this.mtlLoader = new MTLLoader();
                this.mtlLoader.load(src.replace(".obj", ".mtl"), materials => {
                    materials.preload();
                    this.objLoader = new THREE.OBJLoader();
                    this.objLoader.setMaterials(materials);
                    this.objLoader.load(src, obj => {
                        this.objList.set(name, obj);
                        resolve(obj);
                    });
                });
            })
        );
    }

    done() {
        return Promise.all([
            Promise.all(this.imgPromiseList),
            Promise.all(this.objPromiseList)
        ]);
    }

    /**
     *
     * @param {string} name
     * @returns {HTMLImageElement}
     */
    sprite(name) {
        return this.imgList.get(name) || this.fallback.image;
    }

    /**
     * @param {string} name
     * @returns {THREE.Mesh}
     */
    mesh(name) {
        const group = this.objList.get(name);
        if (group && group.children[0]) {
            const mesh = group.children[0];
            if (mesh instanceof THREE.Mesh) {
                return new THREE.Mesh(mesh.geometry, mesh.material);
            }
        }
        return new THREE.Mesh(this.fallback.geometry, this.fallback.material);
    }
}

export function createDefaultImage() {
    try {
        const img = document.createElement("canvas");
        img.width = 64;
        img.height = 64;

        const ctx = img.getContext("2d");
        ctx.fillStyle = "magenta";
        ctx.fillRect(0, 0, 64, 64);
        return img;
    } catch (e) {
        return null;
    }
}
