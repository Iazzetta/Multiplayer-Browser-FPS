import * as THREE from "three";
export class AABB {
    constructor(min = new THREE.Vector3(), max = new THREE.Vector3()) {
        this.min = min;
        this.max = max;
    }
}
