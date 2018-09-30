import Vue from "./vue.js";

// @ts-ignore
Vue.component("level-object", {
    template: "#level-object-vue-template",
    props: ["obj", "tile_size"],
    computed: {
        objStyle() {
            const size = this.tile_size;
            return {
                left: this.obj.x * size + "px",
                top: this.obj.y * size + "px",
                width: size + "px",
                height: size + "px"
            };
        }
    }
});
