import { State } from "./state";
import { Action, shootBullet } from "./actions";
import { Entity } from "./entities";
import { AABB } from "./utils";
import { GRAVITY, JUMP_SPEED } from "./consts";

/**
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function update(state, dispatch) {
    updateTime(state);

    // Systems
    state.entities.forEach(entity => {
        if (entity.sleep) return;
        decaySystem(entity, state, dispatch);
        gravitySystem(entity, state, dispatch);
        pickupSystem(entity, state, dispatch);
        jetpackFuelSystem(entity, state, dispatch);
        damageSystem(entity, state, dispatch);
        controllerSystem(entity, state, dispatch);
        shootingSystem(entity, state, dispatch);
        reloadingSystem(entity, state, dispatch);
        physicsSystem(entity, state, dispatch);
    });

    // Animate pickups
    state.getEntityGroup("pickup").forEach(pickup => {
        pickup.object3D.rotation.y += 0.01;
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
        velocity.y -= GRAVITY * state.time.delta;
    }
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function pickupSystem(entity, state, dispatch) {
    if (entity.object3D && entity.controller) {
        const pickups = state.getEntityGroup("pickup");
        for (let i = 0; i < pickups.length; i++) {
            const pickup = pickups[i];
            const aabb1 = entity.object3D.getAABB();
            const aabb2 = pickup.object3D.getAABB();
            if (AABB.collision(aabb1, aabb2)) {
                // Jetpack
                if (!entity.jetpack && pickup.jetpack) {
                    entity.jetpack = pickup.jetpack;
                    state.deleteEntity(pickup.id);
                    return;
                }

                // Ammo
                if (entity.weapon && pickup.pickupAmmo !== undefined) {
                    if (
                        entity.weapon.reservedAmmo <
                        entity.weapon.type.maxReservedAmmo
                    ) {
                        entity.weapon.reservedAmmo = Math.min(
                            entity.weapon.reservedAmmo + pickup.pickupAmmo,
                            entity.weapon.type.maxReservedAmmo
                        );
                        state.deleteEntity(pickup.id);
                        return;
                    }
                }

                // HP
                if (entity.health && pickup.pickupHp !== undefined) {
                    entity.health.max += pickup.pickupHp;
                    state.deleteEntity(pickup.id);
                    return;
                }
            }
        }
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
 * @param {Entity} bullet
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function damageSystem(bullet, state, dispatch) {
    if (bullet.damage && bullet.collider && bullet.object3D) {
        const players = state.getEntityGroup("player");

        // Hit player
        players.forEach(player => {
            if (player.object3D && player.health) {
                if (player === bullet) return;
                if (player.health.hp <= 0) return;
                if (player.id === bullet.damage.creatorId) return;

                const playerAABB = player.object3D.getAABB();
                const bulletAABB = bullet.object3D.getAABB();
                if (AABB.collision(bulletAABB, playerAABB)) {
                    bullet.collider.x = 1;
                    player.health.hp -= bullet.damage.dmg;
                    if (player.health.hp <= 0) {
                        state.deleteEntity(player.id);
                    }
                }
            }
        });

        // Die on wall collision
        if (bullet.collider.any()) {
            state.deleteEntity(bullet.id);
        }
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
                // Jetpacl
                velocity.y = (velocity.y > 0 ? 0 : velocity.y) + 0.01;
            } else {
                // Normal jump
                if (entity.collider && entity.collider.bottom()) {
                    velocity.y = JUMP_SPEED;
                    input.jump = false;
                }
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
export function shootingSystem(entity, state, dispatch) {
    const { weapon, controller } = entity;
    if (weapon && controller) {
        if (weapon.firerateTimer > 0) {
            weapon.firerateTimer -= state.time.delta;
        }

        if (
            controller.input.shoot &&
            weapon.firerateTimer <= 0 &&
            weapon.reloadTimer === 0 &&
            weapon.loadedAmmo > 0
        ) {
            weapon.loadedAmmo = Math.max(weapon.loadedAmmo - 1, 0);
            weapon.firerateTimer = weapon.type.firerate;
            dispatch(shootBullet(entity.id));
        }
    }
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function reloadingSystem(entity, state, dispatch) {
    const { weapon, controller } = entity;
    if (weapon && controller) {
        const canReload =
            weapon.reloadTimer === 0 &&
            weapon.reservedAmmo > 0 &&
            weapon.loadedAmmo < weapon.type.maxLoadedAmmo;

        if (canReload && (controller.input.reload || weapon.loadedAmmo === 0)) {
            weapon.reloadTimer = weapon.type.reloadSpeed;
        }

        const isRelaoding = weapon.reloadTimer > 0;
        if (isRelaoding) {
            weapon.reloadTimer -= state.time.delta;
            if (weapon.reloadTimer <= 0) {
                weapon.reloadTimer = 0;

                const delta = weapon.type.maxLoadedAmmo - weapon.loadedAmmo;
                const loadedAmmo = Math.min(weapon.reservedAmmo, delta);
                if (loadedAmmo > 0) {
                    weapon.loadedAmmo += loadedAmmo;
                    weapon.reservedAmmo -= loadedAmmo;
                }
            }
        }
    }
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function physicsSystem(entity, state, dispatch) {
    if (entity.object3D && entity.velocity) {
        const walls = state.getEntityGroup("wall");
        const velocity = entity.velocity.getForceVector(state.time.delta);

        const resolveCollision = (entityMin, entityMax, wallMin, wallMax) => {
            const width = (entityMax - entityMin) * 0.51;
            if (entityMin < wallMin) {
                return wallMin - width;
            } else {
                return wallMax + width;
            }
        };

        // Reset collider
        if (entity.collider) {
            entity.collider.set(0, 0, 0);
        }

        // Resolve Y-axis
        entity.object3D.position.y += velocity.y;
        if (entity.collider) {
            // Floor collision
            const floor = 0 + entity.object3D.radius.y;
            if (entity.object3D.position.y < floor && velocity.y <= 0) {
                entity.object3D.position.y = floor;
                entity.velocity.y = 0;
                entity.collider.y = 1;
            }

            walls.forEach(wall => {
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
                    entity.collider.y =
                        entity.object3D.position.y < wall.object3D.position.y
                            ? -1
                            : 1;
                }
            });
        }

        // Resolve X-axis
        entity.object3D.position.x += velocity.x;
        if (entity.collider) {
            walls.forEach(wall => {
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
                    entity.collider.x =
                        entity.object3D.position.x < wall.object3D.position.x
                            ? -1
                            : 1;
                }
            });
        }

        // Resolve Z-axis
        entity.object3D.position.z += velocity.z;
        if (entity.collider) {
            walls.forEach(wall => {
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
                    entity.collider.z =
                        entity.object3D.position.z < wall.object3D.position.z
                            ? -1
                            : 1;
                }
            });
        }
    }
}
