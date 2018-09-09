import * as THREE from "three";
import map from "lodash/map";
import OBJLoader from "three-obj-loader";
OBJLoader(THREE);

export class Assets {
    constructor() {
        /**
         * @type {THREE.Group}
         */
        this.map1 = null;
    }
}

/**
 * @param {object} paths
 * @param {string} paths.map1
 * @returns {Promise<Assets>}
 */
Assets.load = function(paths) {
    const assets = new Assets();
    const loader = new THREE.OBJLoader();
    const loadAssets = map(paths, (path, asset) => {
        return new Promise((resolve, reject) => {
            loader.load(path, group => {
                assets[asset] = group;
                resolve(assets);
            });
        });
    });

    return Promise.all(loadAssets).then(() => assets);
};
