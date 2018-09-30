import Vue from "./vue.js";

// @ts-ignore
Vue.component("level-object", {
    template: "#level-object-vue-template",
    props: ["obj", "tile_size", "grabbed", "selected"],
    computed: {
        objStyle() {
            const size = this.tile_size;
            const style = {
                left: this.obj.x * size + "px",
                top: this.obj.y * size + "px",
                width: size + "px",
                height: size + "px"
            };

            if (this.grabbed) {
                style["pointer-events"] = "none";
            }

            return style;
        }
    },
    methods: {
        onGrab() {
            this.$emit("grab", this.obj);
        }
    }
});
