<template>
    <div class="app">
        <div class="header">
            Level editor
        </div>
        <div class="menu"></div>
        <div class="screen"></div>
        <div class="footer"></div>
    </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.app {
    display: grid;
    grid-gap: 4px;
    grid-template-rows: 64px 1fr 64px;
    grid-template-columns: 8px repeat(8, 1fr) 8px;

    .header {
        grid-row: 1/2;
        grid-column: 2/10;

        line-height: 64px;
    }

    .footer {
        grid-row: 3/4;
        grid-column: 2/10;

        line-height: 64px;
        text-align: center;
    }

    .menu {
        grid-row: 2/3;
        grid-column: 2/4;
    }

    .screen {
        grid-row: 2/3;
        grid-column: 4/10;
    }
}
</style>
