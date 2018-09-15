import * as THREE from "three";
import { State } from "./state";
import { Action } from "./actions";
import { Entity } from "./entities";
import { AABB } from "./utils";

/**
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function update(state, dispatch) {
    updateTime(state);

    state.entities.forEach(entity => {
        decaySystem(entity, state, dispatch);
        gravitySystem(entity, state, dispatch);
        jetpackFuelSystem(entity, state, dispatch);
        damageSystem(entity, state, dispatch);
        controllerSystem(entity, state, dispatch);
        physicsSystem(entity, state, dispatch);
    });
}

/**
 * @param {State} state
 */
export function updateTime(state) {
    const { time } = state;
    const elapsed = Date.now() - time.start;
    time.delta = elapsed - time.elapsed;
    time.elapsed = elapsed;
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function decaySystem(entity, state, dispatch) {
    const { decay } = entity;
    if (decay) {
        decay.ttl -= state.time.delta;
        if (decay.ttl < 0) {
            state.deleteEntity(entity.id);
        }
    }
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function gravitySystem(entity, state, dispatch) {
    const { gravity, velocity } = entity;
    if (gravity && velocity) {
        velocity.y -= 0.001;
    }
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function jetpackFuelSystem(entity, state, dispatch) {
    const { jetpack, controller } = entity;

    if (jetpack && controller) {
        const jump = controller.input.jump;

        // Fly - burn fuel
        if (!jump && jetpack.fuel < jetpack.maxFuel) {
            jetpack.fuel = Math.min(
                jetpack.fuel + state.time.delta,
                jetpack.maxFuel
            );
        }

        // Recharge
        if (jump && jetpack.fuel > jetpack.minFuel) {
            jetpack.fuel = Math.max(
                jetpack.fuel - state.time.delta * 2,
                jetpack.minFuel
            );
        }
    }
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function damageSystem(entity, state, dispatch) {
    const { object3D, damage } = entity;
    if (object3D && damage) {
        state.entities.forEach(target => {
            if (target.object3D && target.health) {
                if (target === entity) return;
                if (target.health.hp <= 0) return;
                if (target.id === entity.damage.creatorId) return;

                // Check collision
                const deltaX = object3D.position.x - target.object3D.position.x;
                const deltaY = object3D.position.y - target.object3D.position.y;
                const deltaZ = object3D.position.z - target.object3D.position.z;
                const distance = Math.sqrt(
                    deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
                );

                if (distance < 0.5) {
                    target.health.hp -= entity.damage.dmg;
                    state.deleteEntity(entity.id);
                }
            }
        });
    }
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function controllerSystem(entity, state, dispatch) {
    const { controller, velocity, object3D } = entity;

    if (controller && velocity && object3D) {
        const input = controller.input;

        // vetical movement - jumping
        if (input.jump) {
            const { jetpack } = entity;
            if (jetpack && jetpack.fuel > 0) {
                velocity.y = (velocity.y > 0 ? 0 : velocity.y) + 0.01;
            } else if (object3D.position.y <= 0) {
                velocity.y = 0.05;
            }
        }

        // Horizontal movement
        velocity.z = (input.forward ? -1 : 0) + (input.back ? 1 : 0);
        velocity.x = (input.left ? -1 : 0) + (input.right ? 1 : 0);

        if (velocity.z !== 0 || velocity.x !== 0) {
            let angle = Math.atan2(velocity.x, velocity.z);
            angle = angle > 0 ? angle : angle + 2 * Math.PI;
            angle += object3D.rotation.y;

            velocity.z = Math.cos(angle);
            velocity.x = Math.sin(angle);
        }

        velocity.z *= controller.speed;
        velocity.x *= controller.speed;
    }
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function physicsSystem(entity, state, dispatch) {
    if (entity.object3D && entity.velocity) {
        const velocity = entity.velocity.getForceVector(state.time.delta);

        const resolveCollision = (entityMin, entityMax, wallMin, wallMax) => {
            const width = (entityMax - entityMin) * 0.51;
            if (entityMin < wallMin) {
                return wallMin - width;
            } else {
                return wallMax + width;
            }
        };

        // Floor collision
        entity.object3D.position.y += velocity.y;
        if (entity.object3D.position.y < 0 && velocity.y <= 0) {
            entity.object3D.position.y = 0;
            velocity.y = 0;
        }

        // Resolve Y-axis
        entity.object3D.position.y += velocity.y;
        state.forEachWallEntity(wall => {
            const aabb1 = entity.object3D.getAABB();
            const aabb2 = wall.object3D.getAABB();
            if (AABB.collision(aabb1, aabb2)) {
                entity.object3D.position.y = resolveCollision(
                    aabb1.min.y,
                    aabb1.max.y,
                    aabb2.min.y,
                    aabb2.max.y
                );
                entity.velocity.y = 0;
            }
        });

        // Resolve X-axis
        entity.object3D.position.x += velocity.x;
        state.forEachWallEntity(wall => {
            const aabb1 = entity.object3D.getAABB();
            const aabb2 = wall.object3D.getAABB();
            if (AABB.collision(aabb1, aabb2)) {
                entity.object3D.position.x = resolveCollision(
                    aabb1.min.x,
                    aabb1.max.x,
                    aabb2.min.x,
                    aabb2.max.x
                );
                entity.velocity.x = 0;
            }
        });

        // Resolve Z-axis
        entity.object3D.position.z += velocity.z;
        state.forEachWallEntity(wall => {
            const aabb1 = entity.object3D.getAABB();
            const aabb2 = wall.object3D.getAABB();
            if (AABB.collision(aabb1, aabb2)) {
                entity.object3D.position.z = resolveCollision(
                    aabb1.min.z,
                    aabb1.max.z,
                    aabb2.min.z,
                    aabb2.max.z
                );
                entity.velocity.z = 0;
            }
        });
    }
}
