<template>
    <div>
        <div class="header">
            {{ view }}
        </div>
        <div class="world-container" ref="screen" @mousewheel="onScroll">
            <div class="world" ref="world"
                :style="worldSizeStyle"
                :class="{ 'grabbed-entity': grabbedEntity !== null }"
                @mousemove="moveEntity"
                @mouseup="dropEntity">

                <div class="background" :style="worldSizeStyle" @click="addEntity"></div>

                <div class="axis-x"></div>
                <div class="axis-y"></div>

                <div class="world-offset">
                    <div class="entity"
                        v-for="el in entities"
                        :key="el.entity.id"
                        :style="el.style"
                        @mousedown="grabEntity($event, el.entity)"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import clamp from "lodash/clamp";
export default {
    props: ["view"],
    data() {
        return {
            worldScale: 4,
            worldScaleAnalog: 4,
            grabbedEntity: null
        };
    },
    computed: {
        screenToWorldSpace(point) {
            const view = this.view;
            const scale = this.worldScale;

            if (view === "front") {
                return function({ x, y }) {
                    return {
                        x: Math.round(x / scale),
                        y: -Math.round(y / scale)
                    };
                };
            }

            if (view === "side") {
                return function({ x, y }) {
                    return {
                        z: Math.round(x / scale),
                        y: -Math.round(y / scale)
                    };
                };
            }

            // Top
            return function({ x, y }) {
                return {
                    x: Math.round(x / scale),
                    z: Math.round(y / scale)
                };
            };
        },
        worldToScreenSpace() {
            const view = this.view;
            const scale = this.worldScale;

            if (view === "front") {
                return function({ x, y }) {
                    return {
                        x: x * scale,
                        y: -y * scale
                    };
                };
            }

            if (view === "side") {
                return function({ z, y }) {
                    return {
                        x: z * scale,
                        y: -y * scale
                    };
                };
            }

            // Top
            return function({ x, z }) {
                return {
                    x: x * scale,
                    y: z * scale
                };
            };
        },
        worldSize() {
            return {
                width: "2048",
                height: "2048"
            };
        },
        worldSizeStyle() {
            return {
                width: this.worldSize.width + "px",
                height: this.worldSize.height + "px"
            };
        },
        entities() {
            const world = this.worldSize;
            const entities = this.$store.state.world.entities;
            const screenSpace = this.worldToScreenSpace;

            return entities.map(entity => {
                const position = screenSpace(entity.position);
                const size = screenSpace(entity.tile.size);
                size.x = Math.abs(size.x);
                size.y = Math.abs(size.y);
                const style = {
                    top: position.y - size.y * 0.5 + "px",
                    left: position.x - size.x * 0.5 + "px",
                    width: size.x + "px",
                    height: size.y + "px"
                };
                return { entity, style };
            });
        }
    },
    methods: {
        /**
         * @param {WheelEvent} ev
         */
        onScroll(ev) {
            if (ev.altKey) {
                ev.preventDefault();
                ev.stopPropagation();

                this.worldScaleAnalog -= ev.deltaY * 0.01;
                this.worldScaleAnalog = clamp(this.worldScaleAnalog, 2, 128);
                this.worldScale = Math.round(this.worldScaleAnalog);
            }
        },
        /**
         * @param {MouseEvent} ev
         */
        addEntity(ev) {
            const world = this.worldSize;
            const { x, z, y } = this.screenToWorldSpace({
                x: Math.round(ev.layerX - world.width * 0.5),
                y: Math.round(ev.layerY - world.height * 0.5)
            });

            this.$store.dispatch("addEntity", { x, z, y });
        },

        /**
         * @param {MouseEvent} ev
         * @param {object} entity
         */
        grabEntity(ev, entity) {
            ev.preventDefault();
            ev.stopPropagation();
            this.grabbedEntity = entity;
        },

        /**
         * @param {MouseEvent} ev
         */
        moveEntity(ev) {
            if (this.grabbedEntity !== null) {
                const world = this.worldSize;
                const { id } = this.grabbedEntity;
                const { x, z, y } = this.screenToWorldSpace({
                    x: Math.round(ev.layerX - world.width * 0.5),
                    y: Math.round(ev.layerY - world.height * 0.5)
                });

                this.$store.commit("MOVE_ENTITY", { id, x, z, y });
            }
        },

        /**
         * @param {MouseEvent} ev
         */
        dropEntity(ev) {
            if (this.grabbedEntity) {
                ev.preventDefault();
                ev.stopPropagation();
                this.grabbedEntity = null;
            }
        },

        centerWorld() {
            const { screen, world } = this.$refs;
            screen.scrollLeft = world.scrollWidth - screen.clientWidth;
            screen.scrollLeft = screen.scrollLeft * 0.5;
            screen.scrollTop = world.scrollHeight - screen.clientHeight;
            screen.scrollTop = screen.scrollTop * 0.5;
        }
    },
    mounted() {
        this.$nextTick(this.centerWorld);
    }
};
</script>

<style scoped lang="scss">
.header {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    padding: 8px;
    padding-right: 48px;
    opacity: 0.5;
    pointer-events: none;
}
.world-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: black;

    .world {
        position: relative;

        * {
            position: absolute;
        }

        .axis-x,
        .axis-y {
            pointer-events: none;
        }

        .axis-x {
            top: 50%;
            width: 100%;
            border-top: 1px solid red;
        }

        .axis-y {
            left: 50%;
            height: 100%;
            border-left: 1px solid limegreen;
        }

        .world-offset {
            top: 50%;
            left: 50%;
        }

        .entity {
            border: 1px solid white;
        }

        &.grabbed-entity {
            * {
                pointer-events: none;
            }
        }
    }
}
</style>
