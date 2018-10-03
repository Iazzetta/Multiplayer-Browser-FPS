import * as THREE from "three";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import { ASSETS_PATH } from "./consts";

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
         * @type {Map<string,object>}
         */
        this.levelList = new Map();

        /**
         * @type {Promise<object>[]}
         */
        this.levelPromiseList = [];

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
                img.src = ASSETS_PATH + src;
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
                const mtlLoader = new MTLLoader();
                mtlLoader.setTexturePath(ASSETS_PATH);
                mtlLoader.setPath(ASSETS_PATH);
                mtlLoader.load(src.replace(".obj", ".mtl"), materials => {
                    const objLoader = new OBJLoader();
                    materials.preload();
                    objLoader.setPath(ASSETS_PATH);
                    objLoader.setMaterials(materials);
                    objLoader.load(src, obj => {
                        this.objList.set(name, obj);
                        resolve(obj);
                    });
                });
            })
        );
    }

    /**
     * @param {string} name
     * @param {string} src
     */
    loadLevel(name, src) {
        this.levelPromiseList.push(
            fetch(ASSETS_PATH + src)
                .then(rsp => rsp.json())
                .then(level => this.levelList.set(name, level))
                .then(() => this.levelList.get(name))
        );
    }

    done() {
        return Promise.all([
            Promise.all(this.imgPromiseList),
            Promise.all(this.objPromiseList),
            Promise.all(this.levelPromiseList)
        ]);
    }

    /**
     *
     * @param {string} name
     * @returns {HTMLImageElement|HTMLCanvasElement}
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

    /**
     * @param {string} name
     * @returns {object}
     */
    level(name) {
        return this.levelList.get(name);
    }

    /**
     * @param {string} name
     * @param {object} data
     */
    setLevel(name, data) {
        this.levelList.set(name, data);
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
