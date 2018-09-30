import Vue from "./vue.js";
import clamp from "lodash/clamp";
import "./level-object.vue.js";
import { ActionHandler, GrabAction, ScaleAction } from "./actions.js";
import { PLAYER_SPAWN, WALL, AMMO_PACK, HEALTH_PACK } from "./object-types";
import { Game } from "../../client/js/game";

new Vue({
    el: "#editor",
    data: {
        game: { running: false, inst: null },
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
                type: PLAYER_SPAWN
            },
            {
                name: "Wall",
                type: WALL
            },
            {
                name: "Ammo pack",
                type: AMMO_PACK
            },
            {
                name: "Health pack",
                type: HEALTH_PACK
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
        onDelete(ev) {
            if (this.selectedObj) {
                console.log(this.selectedObj);
                this.objects = this.objects.filter(obj => {
                    return obj.id !== this.selectedObj.id;
                });
                this.selected_obj_id = null;
            }
        },
        onEscape(ev) {
            if (this.game.running) {
                this.playLevel(false);
            }
        },
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
                type: this.selected_brush_type,
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
        },
        getLevelExportData() {
            const TILE_SIZE = 12;
            const vector3 = vec2 => ({
                x: vec2.x,
                y: TILE_SIZE,
                z: vec2.y
            });

            const myObjects = this.objects;
            const srcObjects = myObjects.concat({
                id: "floor",
                type: "wall",
                x: 0,
                y: 0,
                w: Math.max(...myObjects.map(o => o.x + o.w)),
                h: Math.max(...myObjects.map(o => o.y + o.h))
            });

            const objects = srcObjects.map((obj, index) => {
                const x = obj.x * TILE_SIZE;
                const y = obj.y * TILE_SIZE;
                const w = obj.w * TILE_SIZE;
                const h = obj.h * TILE_SIZE;

                return {
                    id: obj.id,
                    type: obj.type,
                    position: vector3({
                        x: x + w * 0.5,
                        y: y + h * 0.5
                    }),
                    size: vector3({
                        x: w,
                        y: h
                    })
                };
            });

            // Move floor down
            objects.filter(o => o.id === "floor").forEach(floor => {
                floor.position.y -= TILE_SIZE;
            });

            return objects;
        },
        downloadAsJSON() {
            // Download the file
            const objects = this.getLevelExportData();
            const a = document.createElement("a");
            const json = JSON.stringify(objects);
            const file = new Blob([json], { type: "json" });
            a.href = URL.createObjectURL(file);
            a.download = "level.json";
            a.click();
        },
        playLevel(play) {
            this.game.running = play;

            if (this.game.running) {
                const game = new Game();
                this.game.inst = game;

                this.$nextTick()
                    .then(() => game.loadAssets())
                    .then(() => {
                        const objects = this.getLevelExportData();
                        game.state.assets.setLevel("level-1", objects);
                        game.container = this.$refs.gameScreen;
                        game.run();
                    });
            } else {
                this.game.inst.destroy();
                this.game.inst = null;
            }
        }
    },
    mounted() {
        document.addEventListener("keydown", ev => {
            switch (ev.keyCode) {
                case 27:
                    this.onEscape(ev);
                    break;
                case 46:
                    this.onDelete(ev);
                    break;
                default:
                    break;
            }
        });
    }
});
