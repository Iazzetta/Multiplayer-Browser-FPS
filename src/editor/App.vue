<template>
    <div class="app">
        <div class="header">
            Level editor
        </div>
        <div class="menu">
            <Menu></Menu>
        </div>
        <div v-if="gameRunning" class="screen">
            <GameScreen ></GameScreen>
        </div>

        <div v-if="!gameRunning" class="view top-view"><Screen view="top"></Screen></div>
        <div v-if="!gameRunning" class="view side-view"><Screen view="side"></Screen></div>
        <div v-if="!gameRunning" class="view front-view"><Screen view="front"></Screen></div>

        <div class="footer"></div>
    </div>
</template>

<script>
import GameScreen from "./components/GameScreen";
import Screen from "./components/Screen.vue";
import Menu from "./components/Menu.vue";
export default {
    components: {
        GameScreen,
        Screen,
        Menu
    },
    computed: {
        gameRunning() {
            return this.$store.state.game_running;
        }
    },
    mounted() {
        this.$store.dispatch("init");
    }
};
</script>

<style scoped lang="scss">
.app {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-gap: 4px;
    grid-template-rows: 32px 1fr 1fr 8px;
    grid-template-columns: 32px 200px repeat(7, 1fr) 32px;

    .header {
        grid-row: 1/2;
        grid-column: 2/10;
        line-height: 32px;
    }

    .footer {
        grid-row: 3/4;
        grid-column: 2/10;
    }

    .menu {
        grid-row: 2/4;
        grid-column: 2/3;
        position: relative;
    }

    .screen {
        grid-row: 2/4;
        grid-column: 3/10;
        position: relative;
    }

    .view {
        position: relative;

        &.top-view {
            grid-row: 2/4;
            grid-column: 3/7;
        }
        &.side-view {
            grid-row: 2/3;
            grid-column: 7/10;
        }
        &.front-view {
            grid-row: 3/4;
            grid-column: 7/10;
        }
    }
}
</style>
