import { Assets } from "../game/assets.js";
import * as THREE from "three";
import fs from "fs";
import path from "path";
import map from "lodash/map";
import OBJLoader from "three-obj-loader";
OBJLoader(THREE);

export const ASSET_PATHS = {
    map1: path.resolve(__dirname, "../assets/map1.obj"),
    player_head: path.resolve(__dirname, "../assets/player_head.obj")
};

/**
 * @returns {Promise<Assets>}
 */
export function loadAssets() {
    const loader = new THREE.OBJLoader();
    const loadAssets = map(ASSET_PATHS, (assetPath, assetName) => {
        return new Promise(resolve => {
            fs.readFile(assetPath, "utf8", (err, contents) => {
                const asset = loader.parse(contents);
                resolve([assetName, asset]);
            });
        });
    });

    return new Assets().load(loadAssets);
}
