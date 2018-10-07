import * as THREE from "three";
import random from "lodash/random";

export const [GEOMETRY, MATERIAL] = [
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial({
        color: 0x222222
    })
];

export class ParticleSystem extends THREE.Object3D {
    /**
     * @param {THREE.Vector3} point
     */
    emit(point) {
        for (let i = 0; i < 3; i++) {
            const particle = new Particle();
            particle.position.copy(point);
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
                    particle.position.x += particle.velocity.x * dt;
                    particle.position.y += particle.velocity.y * dt * 2;
                    particle.position.z += particle.velocity.z * dt;
                }
            }
        });
    }
}

export class Particle extends THREE.Mesh {
    constructor() {
        super(GEOMETRY, MATERIAL);
        this.ttl = random(500, 1000);
        this.velocity = new THREE.Vector3();

        const speed = 0.0001;
        this.velocity.set(
            random(-100, 100) * speed,
            random(-100, 100) * speed,
            random(-100, 100) * speed
        );

        this.scale.set(random(0.5, 1), random(0.5, 1), random(0.5, 1));
    }
}
