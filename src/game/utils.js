import * as THREE from "three";

// @ts-ignore
import cube_land_map from "../../dist/assets/maps/small-room.json";

export class AABB {
    constructor(min = new THREE.Vector3(), max = new THREE.Vector3()) {
        this.min = min;
        this.max = max;
    }

    toArray() {
        return [this.min.toArray(), this.max.toArray()];
    }
}

/**
 *
 * @param {AABB} aabb1
 * @param {AABB} aabb2
 */
AABB.collision = function(aabb1, aabb2) {
    if (aabb1.min.x > aabb2.max.x) return false;
    if (aabb1.min.y > aabb2.max.y) return false;
    if (aabb1.min.z > aabb2.max.z) return false;

    if (aabb1.max.x < aabb2.min.x) return false;
    if (aabb1.max.y < aabb2.min.y) return false;
    if (aabb1.max.z < aabb2.min.z) return false;

    return true;
};

/**
 * @param {THREE.Vector3=} radius
 */
export function createDebugMesh(radius = new THREE.Vector3(1, 1, 1)) {
    const geometry = new THREE.BoxGeometry(
        radius.x * 2,
        radius.y * 2,
        radius.z * 2
    );
    const geo = new THREE.WireframeGeometry(geometry);
    const mat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 2
    });
    return new THREE.LineSegments(geo, mat);
}

/**
 * @param {number} degrees
 */
export function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

/**
 * @param {number} radians
 */
export function toDegrees(radians) {
    return (radians * 180) / Math.PI;
}

/**
 * @param {(id:number,x:number,y:number,z:number) => any} f
 */
export function forEachMapTile(f) {
    const level = cube_land_map;
    const size = new THREE.Vector3(
        cube_land_map.width,
        cube_land_map.layers.length,
        cube_land_map.height
    );

    for (let y = 0; y < size.y; y++) {
        const layer = level.layers[y];
        for (let x = 0; x < size.x; x++) {
            for (let z = 0; z < size.z; z++) {
                const index = z * size.z + x;
                const id = layer.data[index];
                if (id > 0) {
                    f(id, x, y, z);
                }
            }
        }
    }
}
