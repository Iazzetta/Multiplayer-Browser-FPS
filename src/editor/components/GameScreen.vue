<template>
    <div class="game-screen" ref="screen"></div>
</template>

<script>
import { Game } from "../../client/js/game";

export const game = new Game();

export default {
    mounted() {
        game.loadAssets().then(() => {
            game.container = this.$refs.screen;
            game.run();
        });
    },
    destroyed() {
        game.destroy();
    }
};
</script>

<style  lang="scss">
.game-screen {
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
