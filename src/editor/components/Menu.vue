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
                    :class="{ selected: tile.name === selected_tile }"
                    @click="$store.commit('SELECT_TILE', tile.name)">
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
            return this.$store.state.tileset;
        },
        selected_tile() {
            return this.$store.state.selected_tile;
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
