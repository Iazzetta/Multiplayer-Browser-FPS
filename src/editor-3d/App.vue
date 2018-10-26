<template>
    <div class="app">
        <div class="viewport" ref="viewport"></div>
    </div>
</template>

<script>
import { Editor } from "./editor.js";

export default {
    mounted() {
        const editor = new Editor();
        editor.loadAssets().then(() => {
            editor.container = this.$refs.viewport;
            editor.run();
        });
    }
};
</script>

<style scoped lang="scss">
.app {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-gap: 4px;
    grid-template-rows: 32px 1fr 32px;
    grid-template-columns: 32px 1fr 32px;

    .viewport {
        grid-row: 2/3;
        grid-column: 2/3;
    }
}

.viewport {
    position: relative;
    width: 100%;
    height: 100%;

    canvas {
        position: absolute;
        width: 100%;
        height: 100%;

        &.hud {
            z-index: 10;
            pointer-events: none;
        }
    }
}
</style>
