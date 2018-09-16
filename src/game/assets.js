import * as THREE from "three";
import OBJLoader from "three-obj-loader";
OBJLoader(THREE);

export const [DEFAULT_BOX, DEFAULT_MATERIAL] = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial()
];

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
                this.objLoader.load(src, obj => {
                    this.objList.set(name, obj);
                    resolve(obj);
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
        return new THREE.Mesh(DEFAULT_BOX, DEFAULT_MATERIAL);
    }
}
