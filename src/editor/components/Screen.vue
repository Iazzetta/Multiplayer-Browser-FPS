<template>
    <div class="world-container" ref="screen">
        <div class="world" ref="world">
            <div class="axis-x"></div>
            <div class="axis-y"></div>
        </div>
    </div>
</template>

<script>
export default {
    mounted() {
        this.$nextTick(() => {
            const { screen, world } = this.$refs;
            screen.scrollLeft = world.scrollWidth - screen.clientWidth;
            screen.scrollTop = world.scrollHeight - screen.clientHeight;

            screen.scrollLeft = screen.scrollLeft * 0.5;
            screen.scrollTop = screen.scrollTop * 0.5;
        });
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
