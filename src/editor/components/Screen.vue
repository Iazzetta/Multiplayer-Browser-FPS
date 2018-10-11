<template>
    <div class="world-container" ref="screen">
        <div class="world" ref="world" @click="addEntity">
            <div class="axis-x"></div>
            <div class="axis-y"></div>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        /**
         * @param {MouseEvent} ev
         */
        addEntity(ev) {
            const { world } = this.$refs;
            const x = Math.round(ev.layerX - world.clientWidth * 0.5);
            const z = Math.round(ev.layerY - world.clientHeight * 0.5);
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
        width: 2048px;
        height: 2048px;

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
    }
}
</style>
