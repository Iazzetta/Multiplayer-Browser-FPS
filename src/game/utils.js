import * as THREE from "three";

export class AABB {
    constructor(min = new THREE.Vector3(), max = new THREE.Vector3()) {
        this.min = min;
        this.max = max;
    }

    size() {
        return this.max.clone().sub(this.min);
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
 * @param {string} group
 * @returns {number}
 */
export function counter(group) {
    counter.prototype.counters = counter.prototype.counters || {};
    counter.prototype.counters[group] = counter.prototype.counters[group] || 1;
    counter.prototype.counters[group]++;
    return counter.prototype.counters[group];
}

/**
 * @param {string} name
 */
export function createActionType(name) {
    if (true) {
        return name;
    }
    createActionType.prototype.count = createActionType.prototype.count || 1;
    createActionType.prototype.count++;
    return counter("action-types");
}
