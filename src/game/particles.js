import * as THREE from "three";
import random from "lodash/random";
import { GRAVITY, JUMP_SPEED } from "./consts";

export const [GEOMETRY, MATERIAL] = [
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial({
        color: 0x111111
    })
];

export class ParticleSystem extends THREE.Object3D {
    /**
     * @param {THREE.Vector3} origin
     * @param {THREE.Vector3} entry
     */
    bulletImpact(origin, entry) {
        for (let i = 0; i < 3; i++) {
            const particle = new Particle();
            particle.position.copy(entry);
            particle.velocity
                .copy(entry)
                .sub(origin)
                .normalize()
                .add(
                    new THREE.Vector3(
                        random(-0.5, 0.5),
                        random(-0.5, 0.5),
                        random(-0.5, 0.5)
                    )
                )
                .multiplyScalar(-0.01);

            particle.velocity.y = JUMP_SPEED * 0.2 * Math.random();

            this.add(particle);
        }
    }

    update(dt) {
        this.children.forEach(particle => {
            if (particle instanceof Particle) {
                particle.ttl -= dt;
                if (particle.ttl < 0) {
                    this.remove(particle);
                } else {
                    particle.velocity.y -= GRAVITY * dt;
                    particle.position.x += particle.velocity.x * dt;
                    particle.position.y += particle.velocity.y * dt;
                    particle.position.z += particle.velocity.z * dt;
                }
            }
        });
    }
}

export class Particle extends THREE.Mesh {
    constructor(geometry = GEOMETRY, material = MATERIAL) {
        super(geometry, material);
        this.ttl = random(10000, 50000);
        this.velocity = new THREE.Vector3();
    }
}
