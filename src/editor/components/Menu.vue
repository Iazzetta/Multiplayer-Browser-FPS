<template>
    <div class="menu">
        <button @click="$store.commit('TOGGLE_GAME', !gameRunning)">
            <span v-if="!gameRunning">PLAY</span>
            <span v-if="gameRunning">STOP</span>
        </button>

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
    }
};
</script>

<style scoped lang="scss">
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
