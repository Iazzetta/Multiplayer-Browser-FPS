<template>
    <div>
        <div class="header">
            {{ view }}
        </div>
        <div class="world-container" ref="screen" @mousewheel="onScroll">

            <div class="world" ref="world"
                :style="worldSizeStyle"
                :class="{ 'grabbed-entity': grab.active }"
                @mousemove="moveEntity"
                @mouseup="dropEntity">

                <div class="background" :style="worldSizeStyle" @click="addEntity"></div>

                <div class="axis-x"></div>
                <div class="axis-y"></div>

                <div class="world-offset">
                    <div class="entity"
                        v-for="el in screenEntities"
                        :key="el.entity.id"
                        :style="el.style"
                        :class="{ selected: el.entity.selected }"
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
            grab: {
                active: false
            }
        };
    },
    computed: {
        screenToWorldSpace(point) {
            const view = this.view;
            const scale = this.worldScale;

            if (view === "front") {
                return function({ x, y }) {
                    return {
                        x: x / scale,
                        y: -(y / scale)
                    };
                };
            }

            if (view === "side") {
                return function({ x, y }) {
                    return {
                        z: x / scale,
                        y: -(y / scale)
                    };
                };
            }

            // Top
            return function({ x, y }) {
                return {
                    x: x / scale,
                    z: y / scale
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
        screenEntities() {
            const world = this.worldSize;
            const screenSpace = this.worldToScreenSpace;

            const entities = this.$store.getters.entities;
            return entities.map(entity => {
                const position = screenSpace(entity.position);
                const size = screenSpace(entity.size);
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
        },
        selectedEntities() {
            return this.$store.getters.entities.filter(
                entity => entity.selected
            );
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
         * @param {KeyboardEvent} ev
         */
        onKeydown(ev) {
            const [DEL] = [46];
            if (ev.keyCode === DEL) {
                this.$store.dispatch("deleteSelectedEntity");
            }
        },

        /**
         * @param {MouseEvent} ev
         */
        addEntity(ev) {
            const world = this.worldSize;
            const tile = this.$store.getters.selectedTile;
            const { x, z, y } = this.screenToWorldSpace({
                x: Math.round(ev.layerX - world.width * 0.5),
                y: Math.round(ev.layerY - world.height * 0.5)
            });

            this.$store
                .dispatch("addEntity", { tile, x, z, y })
                .then(entity => {
                    this.$store.dispatch("deselectEntityAll");
                    this.$store.dispatch("selectEntity", { id: entity.id });
                });
        },

        /**
         * @param {MouseEvent} ev
         * @param {object} entity
         */
        grabEntity(ev, entity) {
            ev.preventDefault();
            ev.stopPropagation();

            this.$store.dispatch("selectEntity", { id: entity.id });
            this.grab.active = true;
        },

        /**
         * @param {MouseEvent} ev
         */
        moveEntity(ev) {
            if (this.grab.active) {
                console.log({ ev });
                const world = this.worldSize;
                const screenSpace = this.worldToScreenSpace;
                const worldSpace = this.screenToWorldSpace;
                this.selectedEntities.forEach(entity => {
                    const position = screenSpace(entity.position);
                    const { x, z, y } = worldSpace({
                        x: Math.round(position.x + ev.movementX),
                        y: Math.round(position.y + ev.movementY)
                    });

                    const { id } = entity;
                    this.$store.commit("MOVE_ENTITY", { id, x, z, y });
                });
            }
        },

        /**
         * @param {MouseEvent} ev
         */
        dropEntity(ev) {
            if (this.grab.active) {
                ev.preventDefault();
                ev.stopPropagation();
                this.grab.active = false;
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
        document.addEventListener("keydown", ev => {
            this.onKeydown(ev);
        });
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
            opacity: 0.25;
            z-index: 1;

            &.selected {
                opacity: 0.75;
                border-color: orange;
                background-color: cornflowerblue;
                z-index: 100;
            }
        }

        &.grabbed-entity {
            * {
                pointer-events: none;
            }
        }
    }
}
</style>
