<template>
    <div class="game-screen" ref="screen"></div>
</template>

<script>
import { Game } from "../../client/js/game";
import { loadLevel, playerJoin, setMyPlayerId } from "../../game/actions";

let game;

export default {
    mounted() {
        const level = this.$store.getters.levelExport;
        game = new Game();
        game.loadAssets().then(() => {
            game.container = this.$refs.screen;
            game.run();
            game.dispatch(loadLevel(level));
            game.dispatch(setMyPlayerId("editor"));
            game.dispatch(playerJoin("editor"));
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
