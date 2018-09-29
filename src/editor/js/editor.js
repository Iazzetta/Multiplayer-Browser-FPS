import Vue from "./vue.js";
import map from "lodash/map";

new Vue({
    el: "#editor",
    data() {
        return {
            brush: "wall",
            brush_options: [
                { type: "wall", style: { background: "#697478" } },
                { type: "player", style: { background: "cornflowerblue" } },
                { type: "bullet-pickup", style: { background: "#b87ecf" } }
            ],
            select_object: null,
            draw_object: null,
            draw_object_origin: { x: 0, y: 0 },
            grid: {
                cell_size: 32,
                rows: 16,
                cols: 16
            },
            level: {
                objects: []
            }
        };
    },
    computed: {
        viewportClass() {
            if (this.draw_object !== null) {
                return "mode--drawing";
            }
        },
        levelStyle() {
            const { cols, rows, cell_size } = this.grid;
            return {
                width: cols * cell_size + "px",
                height: rows * cell_size + "px"
            };
        },
        cellStyle() {
            return {
                width: this.grid.cell_size + "px",
                height: this.grid.cell_size + "px"
            };
        },
        levelRects() {
            const { cell_size } = this.grid;
            const colors = this.brush_options.reduce((colors, opt) => {
                colors[opt.type] = opt.style.background;
                return colors;
            }, {});
            return map(this.level.objects, obj => {
                const { x, y, w, h } = obj;
                const style = {
                    background: colors[obj.type],
                    top: y * cell_size + "px",
                    left: x * cell_size + "px",
                    width: w * cell_size + "px",
                    height: h * cell_size + "px"
                };

                const classList = [];
                if (this.select_object && this.select_object.id === obj.id) {
                    classList.push("selected");
                }

                return { obj, style, classList };
            });
        }
    },
    watch: {
        "level.objects": function(objects) {
            const objIds = objects.map(obj => obj.id);
            const missing = obj => obj && objIds.indexOf(obj.id) === -1;

            if (missing(this.select_object)) {
                this.select_object = null;
            }

            if (missing(this.draw_object)) {
                this.draw_object = null;
            }
        }
    },
    methods: {
        onDelete(ev) {
            if (this.select_object !== null) {
                this.level.objects = this.level.objects.filter(obj => {
                    return obj.id !== this.select_object.id;
                });
            }
        },
        getMouseGridPoint(ev) {
            function getOffset(object, offset = { x: 0, y: 0 }) {
                if (!object) return offset;
                offset.x += object.offsetLeft;
                offset.y += object.offsetTop;

                return getOffset(object.offsetParent, offset);
            }

            const grid = getOffset(this.$refs.grid);
            const point = {
                x: ev.clientX - grid.x,
                y: ev.clientY - grid.y
            };

            return {
                x: Math.floor(point.x / this.grid.cell_size),
                y: Math.floor(point.y / this.grid.cell_size)
            };
        },
        drawObjectBegin(ev, obj = null) {
            if (this.draw_object === null) {
                const { x, y } = this.getMouseGridPoint(ev);
                this.draw_object_origin = { x, y };
                this.draw_object = this.addObject(x, y);
                this.select_object = this.draw_object;
            }
        },
        drawObject(ev) {
            if (this.draw_object !== null) {
                const { x, y } = this.getMouseGridPoint(ev);
                const origin = this.draw_object_origin;
                const min = {
                    x: Math.min(x, origin.x),
                    y: Math.min(y, origin.y)
                };
                const max = {
                    x: Math.max(x, origin.x),
                    y: Math.max(y, origin.y)
                };

                this.draw_object.x = min.x;
                this.draw_object.y = min.y;
                this.draw_object.w = max.x - min.x + 1;
                this.draw_object.h = max.y - min.y + 1;
            }
        },
        drawObjectEnd(ev) {
            if (this.draw_object !== null) {
                this.draw_object = null;
            }
        },
        addObject(x, y, w = 1, h = 1) {
            const id = Date.now().toString(16);
            const type = this.brush;
            const obj = { id, type, x, y, w, h };
            this.level.objects.push(obj);
            return obj;
        },
        selectObject(obj) {
            this.select_object = obj;
        },
        resizeObj(obj, point) {
            this.draw_object = obj;
            switch (point) {
                case "tl": {
                    this.draw_object_origin = {
                        x: obj.x + obj.w - 1,
                        y: obj.y + obj.h - 1
                    };
                    break;
                }
                case "tr": {
                    this.draw_object_origin = {
                        x: obj.x,
                        y: obj.y + obj.h - 1
                    };
                    break;
                }
                case "bl": {
                    this.draw_object_origin = {
                        x: obj.x + obj.w - 1,
                        y: obj.y
                    };
                    break;
                }
                case "br": {
                    this.draw_object_origin = {
                        x: obj.x,
                        y: obj.y
                    };
                    break;
                }
            }
        },
        setBrush(brush) {
            this.brush = brush;
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
