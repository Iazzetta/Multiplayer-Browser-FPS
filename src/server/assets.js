import { Assets } from "../game/assets.js";
import * as THREE from "three";
import fs from "fs";
import path from "path";
import map from "lodash/map";
import OBJLoader from "three-obj-loader";
OBJLoader(THREE);

export const ASSET_PATHS = {
    map1: path.resolve(__dirname, "../assets/map1.obj")
};

/**
 * @returns {Promise<Assets>}
 */
export function loadAssets() {
    const assets = new Assets();
    const loader = new THREE.OBJLoader();
    const loadAssets = map(ASSET_PATHS, (path, asset) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path, "utf8", (err, contents) => {
                assets[asset] = loader.parse(contents);
                resolve(asset);
            });
        });
    });

    return Promise.all(loadAssets).then(() => assets);
}
