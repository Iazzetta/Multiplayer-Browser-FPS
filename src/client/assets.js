import { Assets } from "../game/assets.js";
import * as THREE from "three";
import map from "lodash/map";
import OBJLoader from "three-obj-loader";
OBJLoader(THREE);

// @ts-ignore
import map1 from "../assets/map1.obj";
// @ts-ignore
import player_head from "../assets/player_head.obj";
// @ts-ignore
import player_body from "../assets/player_body.obj";

export const ASSET_PATHS = { map1, player_head, player_body };

/**
 * @returns {Promise<Assets>}
 */
export function loadAssets() {
    const loader = new THREE.OBJLoader();
    const loadAssets = map(ASSET_PATHS, (assetPath, assetName) => {
        return new Promise(resolve => {
            loader.load(assetPath, asset => {
                resolve([assetName, asset]);
            });
        });
    });

    return new Assets().load(loadAssets);
}
