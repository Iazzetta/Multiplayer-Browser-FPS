<template>
    <div class="app">
        <div class="header">
            Level editor
        </div>
        <div class="menu">
            <Menu></Menu>
        </div>
        <div class="screen">
            <Screen></Screen>
        </div>
        <div class="footer"></div>
    </div>
</template>

<script>
import Screen from "./components/Screen.vue";
import Menu from "./components/Menu.vue";
export default {
    components: {
        Screen,
        Menu
    }
};
</script>

<style scoped lang="scss">
.app {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-gap: 4px;
    grid-template-rows: 64px 1fr 64px;
    grid-template-columns: 32px repeat(8, 1fr) 32px;

    .header {
        grid-row: 1/2;
        grid-column: 2/10;
        line-height: 64px;
    }

    .footer {
        grid-row: 3/4;
        grid-column: 2/10;
    }

    .menu {
        grid-row: 2/3;
        grid-column: 2/4;
        position: relative;
    }

    .screen {
        grid-row: 2/3;
        grid-column: 4/10;
        position: relative;
    }
}
</style>
