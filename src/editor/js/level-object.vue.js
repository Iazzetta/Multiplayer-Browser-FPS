import Vue from "./vue.js";

// @ts-ignore
Vue.component("level-object", {
    template: "#level-object-vue-template",
    props: ["obj", "tile_size", "grabbed", "selected"],
    computed: {
        objStyle() {
            const size = this.tile_size;
            return {
                left: this.obj.x * size + "px",
                top: this.obj.y * size + "px",
                width: this.obj.w * size + "px",
                height: this.obj.h * size + "px"
            };
        }
    },
    methods: {
        onGrab(ev) {
            this.$emit("grab", this.obj);
        },
        onScale(ev, x, y) {
            this.$emit("scale", {
                obj: this.obj,
                dir: { x, y }
            });
            ev.stopPropagation();
            ev.preventDefault();
        }
    }
});
