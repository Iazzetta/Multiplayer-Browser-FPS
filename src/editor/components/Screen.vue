<template>
    <div class="world-container" ref="screen">
        <div class="world" ref="world" :style="worldSizeStyle" @click="addEntity">
            <div class="axis-x"></div>
            <div class="axis-y"></div>

            <div class="entity"
                v-for="el in entities"
                :key="el.entity.id"
                :style="el.style"></div>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
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

            return entities.map(entity => {
                const position = entity.position;
                const size = entity.tile.size;
                const style = {
                    top: position.z + "px",
                    left: position.x + "px",
                    width: size.x + "px",
                    height: size.z + "px"
                };
                return { entity, style };
            });
        }
    },
    methods: {
        /**
         * @param {MouseEvent} ev
         */
        addEntity(ev) {
            const world = this.worldSize;
            const x = Math.round(ev.layerX);
            const z = Math.round(ev.layerY);
            const y = 0;
            this.$store.dispatch("addEntity", { x, y, z }).then(entity => {
                console.log({ entity });
            });
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
.world-container {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: black;

    .world {
        position: relative;

        * {
            position: absolute;
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

        .entity {
            border: 1px solid white;
        }
    }
}
</style>
