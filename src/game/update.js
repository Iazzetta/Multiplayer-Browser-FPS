import * as THREE from "three";
import { State } from "./state";
import {
    Action,
    hitPlayer,
    serverAction,
    killPlayer,
    spawnPlayer,
    syncPlayerScore
} from "./actions";
import { Entity } from "./entities";
import { AABB } from "./utils";
import { GRAVITY, JUMP_SPEED, RUN_SPEED, DEBUG } from "./consts";
import sample from "lodash/sample";
import intersection from "ray-aabb-intersection";

/**
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function update(state, dispatch) {
    updateTime(state);

    // Systems
    state.forEachEntity(entity => {
        if (entity.sleep) return;
        respawnSystem(entity, state, dispatch);
        playerControllerSystem(entity, state, dispatch);
        gravitySystem(entity, state, dispatch);
        shootingSystem(entity, state, dispatch);
        reloadingSystem(entity, state, dispatch);
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
export function respawnSystem(entity, state, dispatch) {
    const { player } = entity;
    if (player && player.respawnTimer > 0) {
        player.respawnTimer -= state.time.delta;
        if (player.respawnTimer < 0) {
            player.respawnTimer = 0;
            const spawn = DEBUG
                ? state.playerSpawns[0]
                : sample(state.playerSpawns);
            dispatch(serverAction(spawnPlayer(player, spawn)));
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
export function playerControllerSystem(entity, state, dispatch) {
    const { player, velocity, object3D } = entity;

    if (player && velocity && object3D) {
        const input = player.input;

        // Reset state
        player.state = "idle";

        // vetical movement - jumping
        if (input.jump) {
            // Normal jump
            if (entity.collider && entity.collider.bottom()) {
                velocity.y = JUMP_SPEED;
                input.jump = false;
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

            player.state = "running";
        }

        velocity.z *= RUN_SPEED;
        velocity.x *= RUN_SPEED;
    }
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function shootingSystem(entity, state, dispatch) {
    const { weapon, player } = entity;
    if (weapon && player) {
        if (weapon.firerateTimer > 0) {
            player.state = "shooting";
            weapon.firerateTimer -= state.time.delta;
        }

        if (
            player.input.shoot &&
            weapon.firerateTimer <= 0 &&
            weapon.reloadTimer === 0 &&
            weapon.loadedAmmo > 0
        ) {
            weapon.loadedAmmo = Math.max(weapon.loadedAmmo - 1, 0);
            weapon.firerateTimer = weapon.type.firerate;

            // Hitscan
            const dirMatrix = new THREE.Matrix4();
            dirMatrix.extractRotation(entity.head.matrixWorld);

            const origin = entity.object3D.position.toArray();
            const dir = new THREE.Vector3(0, 0, -1)
                .applyMatrix4(dirMatrix)
                .toArray();

            const hitscan = {
                point: new Float32Array(3),
                entity: null,
                dist: Infinity
            };

            state.forEachEntity(target => {
                if (target.id === entity.id) return;
                if (!target.object3D) return;
                const aabb = target.object3D.toAABB().toArray();
                const dist = intersection.distance(origin, dir, aabb);
                if (dist > 0 && dist < hitscan.dist) {
                    hitscan.entity = target;
                    hitscan.dist = dist;
                    intersection(hitscan.point, origin, dir, aabb);
                }
            });

            if (hitscan.entity && hitscan.entity.health) {
                const target = hitscan.entity;
                const sync = a => dispatch(serverAction(a));
                const hp = target.health.hp - 10;
                if (hp > 0) {
                    sync(hitPlayer(target.id, hp));
                } else {
                    const killer = entity;
                    if (killer && killer.player) {
                        const { id, kills, deaths } = killer.player;
                        sync(syncPlayerScore(id, kills + 1, deaths));
                    }

                    if (target.player) {
                        const { id, kills, deaths } = target.player;
                        sync(syncPlayerScore(id, kills, deaths + 1));
                    }

                    sync(killPlayer(target.id));
                }
            }

            // Bullet trace
            const p1 = new THREE.Vector3(...origin);
            const p2 = new THREE.Vector3(...hitscan.point);

            const material = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });

            const geometry = new THREE.Geometry();
            geometry.vertices.push(p1, p2);

            const line = new THREE.Line(geometry, material);
            state.scene.add(line);
            setTimeout(() => {
                state.scene.remove(line);
            }, 500);
        }
    }
}

/**
 * @param {Entity} entity
 * @param {State} state
 * @param {(action:Action)=>any} dispatch
 */
export function reloadingSystem(entity, state, dispatch) {
    const { weapon, player } = entity;
    if (weapon && player) {
        const canReload =
            weapon.reloadTimer === 0 &&
            weapon.reservedAmmo > 0 &&
            weapon.loadedAmmo < weapon.type.maxLoadedAmmo;

        if (canReload && (player.input.reload || weapon.loadedAmmo === 0)) {
            weapon.reloadTimer = weapon.type.reloadSpeed;
        }

        const isRelaoding = weapon.reloadTimer > 0;
        if (isRelaoding) {
            player.state = "reloading";
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
            const width = (entityMax - entityMin) * 0.50000001;
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
                const aabb1 = entity.object3D.toAABB();
                const aabb2 = wall.object3D.toAABB();
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
                const aabb1 = entity.object3D.toAABB();
                const aabb2 = wall.object3D.toAABB();
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
                const aabb1 = entity.object3D.toAABB();
                const aabb2 = wall.object3D.toAABB();
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
