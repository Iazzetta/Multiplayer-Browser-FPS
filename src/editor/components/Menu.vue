<template>
    <div class="menu">
        <button @click="$store.commit('TOGGLE_GAME', !gameRunning)">
            <span v-if="!gameRunning">PLAY</span>
            <span v-if="gameRunning">STOP</span>
        </button>

        <button @click="downloadAsJSON">Export</button>

        <div class="tileset">
            <ul>
                <li v-for="tile in tileset"
                    :key="tile.name"
                    :class="{ selected: tile.selected }"
                    @click="$store.dispatch('selectTile', { tile: tile.name })">
                    {{ tile.name }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        tileset() {
            return this.$store.getters.tileset;
        },
        gameRunning() {
            return this.$store.state.game_running;
        }
    },
    methods: {
         downloadAsJSON() {
            // Download the file
            const json = JSON.stringify(this.$store.getters.levelExport);


            const a = document.createElement("a");
            const file = new Blob([json], { type: "json" });
            a.href = URL.createObjectURL(file);
            a.download = "level.json";
            a.click();
        }
    }
};
</script>

<style scoped lang="scss">
.menu {
    padding: 16px;
}

button {
    display: block;
    width: 100%;
    margin-bottom: 8px;
}

ul {
    list-style: none;

    li {
        opacity: 0.5;
        padding: 4px;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }

        &.selected {
            color: orange;
            opacity: 1;
        }
    }
}
</style>
