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
        selected_obj_id: null,
        action: null
    },
    computed: {
        viewportClassList() {
            const classList = [];
            if (this.action === "grab") {
                classList.push("grabbing");
            }
            return classList;
        },
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
        },
        selectedObj() {
            const id = this.selected_obj_id;
            return this.objects.find(obj => obj.id === id);
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
            this.selected_obj_id = obj.id;
        },
        /**
         * @param {MouseEvent} ev
         */
        onMouseDown(ev) {},
        /**
         * @param {MouseEvent} ev
         */
        onMouseMove(ev) {
            if (!this.selectedObj) {
                return;
            }

            switch (this.action) {
                case "grab":
                    this.selectedObj.x = Math.floor(ev.layerX / this.tile_size);
                    this.selectedObj.y = Math.floor(ev.layerY / this.tile_size);
                    ev.stopPropagation();
                    ev.preventDefault();
                    break;
            }
        },
        /**
         * @param {MouseEvent} ev
         */
        onMouseUp(ev) {
            this.action = null;
        },

        /**
         * @param {number} delta
         */
        zoom(delta) {
            this.tile_size = clamp(this.tile_size + delta, 8, 64);
            this.tile_site = Math.round(this.tile_size);
        },
        grabObj(obj) {
            this.selected_obj_id = obj.id;
            this.action = "grab";
        },
        scaleObj(ev) {
            const { obj, dir } = ev;
            console.log(obj, dir);
        }
    }
});
