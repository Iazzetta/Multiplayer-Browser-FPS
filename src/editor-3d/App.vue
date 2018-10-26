<template>
    <div class="app">
        <div class="viewport" ref="viewport"></div>
        <div class="menu">
            <label class="btn"  for="file">
                LOAD
                <input @change="importJSON" id="file" name="file" type="file" value="json" />
            </label>
            <button class="btn" @click="downloadJSON">DOWNLOAD</button>
            <hr>
            <button v-if="!game_running" class="btn" @click="play">PLAY</button>
            <button v-if="game_running" class="btn" @click="stop">STOP</button>
        </div>
    </div>
</template>

<script>
import { Editor } from "./editor.js";
import { loadLevel } from "../game/actions.js";

const editor = new Editor();

export default {
    data() {
        return {
            game_running: false
        };
    },

    methods: {
        importJSON(ev) {
            const [file] = ev.target.files;
            const reader = new FileReader();
            reader.onload = event => {
                console.log({ reader });
                try {
                    if (event.target.readyState === 2) {
                        const level = JSON.parse(reader.result);
                        editor.importLevelJson(level);
                    }
                } catch (e) {
                    console.log(e);
                    alert("Invalid file");
                }
            };
            reader.readAsText(file);
        },
        downloadJSON() {
            const json = JSON.stringify(editor.exportLevelJson());
            const a = document.createElement("a");
            const file = new Blob([json], { type: "json" });
            a.href = URL.createObjectURL(file);
            a.download = "level.json";
            a.click();
        },
        play() {
            this.game_running = true;
            editor.runGame();
        },
        stop() {
            this.game_running = false;
            editor.runEditor();
        }
    },

    mounted() {
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
    grid-gap: 8px;
    grid-template-rows: 64px 1fr 32px;
    grid-template-columns: 32px 200px 1fr 32px;

    .menu {
        grid-row: 2/3;
        grid-column: 2/3;
    }

    .viewport {
        grid-row: 2/3;
        grid-column: 3/4;
    }
}

.menu {
    .btn {
        display: block;
        outline: 0;
        border: 0;
        margin-bottom: 8px;
        padding: 8px;
        width: 100%;

        color: white;
        background-color: cornflowerblue;

        text-align: center;
        cursor: pointer;

        font-size: 16px;
        font-weight: normal;

        input[type="file"] {
            display: none;
        }
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
