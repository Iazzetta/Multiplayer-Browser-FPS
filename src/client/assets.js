import { Assets } from "../game/assets.js";
import * as THREE from "three";
import map from "lodash/map";
import OBJLoader from "three-obj-loader";
OBJLoader(THREE);

// @ts-ignore
import map1 from "../assets/map1.obj";
export const ASSET_PATHS = { map1 };

/**
 * @returns {Promise<Assets>}
 */
export function loadAssets() {
    const assets = new Assets();
    const loader = new THREE.OBJLoader();
    const loadAssets = map(ASSET_PATHS, (path, asset) => {
        return new Promise((resolve, reject) => {
            loader.load(path, group => {
                assets[asset] = group;
                resolve(assets);
            });
        });
    });
    return Promise.all(loadAssets).then(() => assets);
}
