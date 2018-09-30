import Vue from "./vue.js";
import clamp from "lodash/clamp";
import "./level-object.vue.js";
import { ActionHandler, GrabAction, ScaleAction } from "./actions.js";

new Vue({
    el: "#editor",
    data: {
        tile_size: 32,
        rows: 64,
        cols: 64,
        objects: [],
        selected_obj_id: null,
        action: null,
        actionHandler: ActionHandler.Empty(),
        selected_brush_type: "wall",
        brushes: [
            {
                name: "Player spawn",
                type: "player-spawn"
            },
            {
                name: "Wall",
                type: "wall"
            },
            {
                name: "Ammo pack",
                type: "ammo-pack"
            },
            {
                name: "Health pack",
                type: "health-pack"
            }
        ]
    },
    computed: {
        viewportClassList() {
            const classList = [];
            if (this.action) {
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
                y: Math.floor(ev.layerY / this.tile_size),
                w: 1,
                h: 1
            };
            this.objects.push(obj);
            this.selected_obj_id = obj.id;
        },
        /**
         * @param {MouseEvent} ev
         */
        onMouseMove(ev) {
            if (this.selectedObj) {
                this.actionHandler.onMouseMove(ev, this.selectedObj);
            }
        },
        /**
         * @param {MouseEvent} ev
         */
        onMouseUp(ev) {
            this.actionHandler.onMouseUp(ev, this.selectedObj);
            this.actionHandler = ActionHandler.Empty();
            this.action = null;
        },

        /**
         * @param {number} delta
         */
        zoom(delta) {
            this.tile_size = clamp(this.tile_size + delta, 8, 64);
            this.tile_site = Math.round(this.tile_size);
        },
        grabObj(ev, obj) {
            this.selected_obj_id = obj.id;
            this.action = "grab";
            this.actionHandler = new GrabAction(this);
            this.actionHandler.onMouseDown(ev);
        },
        scaleObj(ev, { obj, dir }) {
            this.selected_obj_id = obj.id;
            this.action = "scale";
            this.actionHandler = new ScaleAction(this, dir);
            this.actionHandler.onMouseDown(obj, dir);
        }
    }
});
