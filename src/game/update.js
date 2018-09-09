import { State } from "./state";
import { Action } from "./actions";
import { Entity } from "./entities";

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
                jetpack.fuel - state.time.delta,
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
    const { mesh, damage } = entity;
    if (mesh && damage) {
        state.entities.forEach(target => {
            if (target.mesh && target.health) {
                if (target === entity) return;
                if (target.health.hp <= 0) return;
                if (target.id === entity.damage.creatorId) return;

                // Check collision
                const deltaX = mesh.position.x - target.mesh.position.x;
                const deltaY = mesh.position.y - target.mesh.position.y;
                const deltaZ = mesh.position.z - target.mesh.position.z;
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
    const { controller, velocity, mesh } = entity;

    if (controller && velocity && mesh) {
        const input = controller.input;

        // vetical movement - jumping
        if (input.jump) {
            const { jetpack } = entity;
            if (jetpack && jetpack.fuel > 0) {
                velocity.y = (velocity.y > 0 ? 0 : velocity.y) + 0.01;
            } else if (mesh.position.y <= 0) {
                velocity.y = 0.01;
            }
        }

        // Horizontal movement
        velocity.z = (input.forward ? -1 : 0) + (input.back ? 1 : 0);
        velocity.x = (input.left ? -1 : 0) + (input.right ? 1 : 0);

        if (velocity.z !== 0 || velocity.x !== 0) {
            let angle = Math.atan2(velocity.x, velocity.z);
            angle = angle > 0 ? angle : angle + 2 * Math.PI;
            angle += mesh.rotation.y;

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
    const { mesh, velocity } = entity;
    if (mesh && velocity) {
        // Apply velocity
        mesh.position.x += velocity.x * state.time.delta;
        mesh.position.z += velocity.z * state.time.delta;
        mesh.position.y += velocity.y * state.time.delta;

        // Floor collision
        if (mesh.position.y <= 0 && velocity.y <= 0) {
            mesh.position.y = 0;
            velocity.y = 0;
        }
    }
}
