import * as THREE from "three";
export class AABB {
    constructor(min = new THREE.Vector3(), max = new THREE.Vector3()) {
        this.min = min;
        this.max = max;
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
