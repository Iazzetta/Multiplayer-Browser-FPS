import * as THREE from "three";
import random from "lodash/random";
import { GRAVITY, JUMP_SPEED } from "./consts";

export const [GEOMETRY, MATERIAL_DUST, MATERIAL_BLOOD] = [
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial({
        color: 0x111111
    }),
    new THREE.MeshBasicMaterial({
        color: 0xee1111
    })
];

export class ParticleSystem extends THREE.Object3D {
    /**
     * @param {THREE.Vector3} origin
     * @param {THREE.Vector3} entry
     */
    bulletImpactPlayer(origin, entry) {
        this.bulletImpact(MATERIAL_BLOOD, origin, entry);
    }

    /**
     * @param {THREE.Vector3} origin
     * @param {THREE.Vector3} entry
     */
    bulletImpactWall(origin, entry) {
        this.bulletImpact(MATERIAL_DUST, origin, entry);
    }

    /**
     * @param {THREE.MeshBasicMaterial} material
     * @param {THREE.Vector3} origin
     * @param {THREE.Vector3} entry
     */
    bulletImpact(material, origin, entry) {
        for (let i = 0; i < 10; i++) {
            const particle = new Particle(GEOMETRY, material);
            particle.position.copy(entry);
            particle.rotation.set(random(0, 6), random(0, 6), random(0, 6));
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
                .multiplyScalar(-0.005);

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
                    particle.scale.multiplyScalar(0.99);
                }
            }
        });
    }
}

export class Particle extends THREE.Mesh {
    constructor(geometry = GEOMETRY, material = MATERIAL_DUST) {
        super(geometry, material);
        this.ttl = random(1000, 5000);
        this.velocity = new THREE.Vector3();

        const size = random(0.1, 0.5);
        this.scale.set(size, size, size);
    }
}
