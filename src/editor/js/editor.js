import Vue from "./vue.js";
import clamp from "lodash/clamp";
import "./level-object.vue.js";

new Vue({
    el: "#editor",
    data: {
        tile_size: 64,
        rows: 64,
        cols: 64,
        objects: [],
        grabbed_obj: null,
        selected_obj: null
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
        onGridClick(ev) {
            const obj = {
                id: Date.now().toString(16),
                x: Math.floor(ev.layerX / this.tile_size),
                y: Math.floor(ev.layerY / this.tile_size)
            };
            this.objects.push(obj);
            this.selected_obj = obj;
        },
        /**
         * @param {MouseEvent} ev
         */
        onMouseDown(ev) {},
        /**
         * @param {MouseEvent} ev
         */
        onMouseMove(ev) {
            if (this.grabbed_obj !== null) {
                this.grabbed_obj.x = Math.floor(ev.layerX / this.tile_size);
                this.grabbed_obj.y = Math.floor(ev.layerY / this.tile_size);
                ev.stopPropagation();
                ev.preventDefault();
            }
        },
        /**
         * @param {MouseEvent} ev
         */
        onMouseUp(ev) {
            if (this.grabbed_obj !== null) {
                this.grabbed_obj = null;
            }
        },

        /**
         * @param {number} delta
         */
        zoom(delta) {
            this.tile_size = clamp(this.tile_size + delta, 8, 64);
            this.tile_site = Math.round(this.tile_size);
        },
        grabObj(obj) {
            if (this.grabbed_obj === null) {
                this.grabbed_obj = this.objects.find(o => o.id === obj.id);
                this.selected_obj = this.grabbed_obj;
            }
        },
        scaleObj(ev) {
            const { obj, dir } = ev;
            console.log(obj, dir)
        }
    }
});
