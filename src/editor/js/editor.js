import Vue from "./vue.js";
import clamp from "lodash/clamp";
import "./level-object.vue.js";

new Vue({
    el: "#editor",
    data: {
        tile_size: 24,
        rows: 64,
        cols: 64,
        objects: []
    },
    computed: {
        gridSizeStyle() {
            return {
                width: this.tile_size * this.cols + "px",
                height: this.tile_size * this.rows + "px"
            };
        },
        gridCellStyle() {
            return {
                width: this.tile_size + "px",
                height: this.tile_size + "px"
            };
        }
    },
    methods: {
        /**
         * @param  {MouseWheelEvent} ev
         */
        onScroll(ev) {
            if (ev.altKey) {
                const delta = ev.wheelDelta * 0.01;
                this.zoom(delta);
                ev.preventDefault();
            }
        },
        /**
         * @param {MouseEvent} ev
         */
        onViewportClick(ev) {
            const obj = {
                id: Date.now().toString(16),
                x: Math.floor(ev.layerX / this.tile_size),
                y: Math.floor(ev.layerY / this.tile_size)
            };
            console.log(obj);
            this.objects.push(obj);
        },

        /**
         * @param {number} delta
         */
        zoom(delta) {
            this.tile_size = clamp(this.tile_size + delta, 8, 64);
            this.tile_site = Math.round(this.tile_size);
        }
    }
});
