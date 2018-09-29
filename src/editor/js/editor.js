import Vue from "./vue.js";
import map from "lodash/map";

new Vue({
    el: "#editor",
    data() {
        return {
            select_object: null,
            draw_object: null,
            draw_object_origin: { x: 0, y: 0 },
            grid: {
                cell_size: 32,
                rows: 16,
                cols: 16
            },
            level: {
                objects: [
                    {
                        id: "wall-1",
                        x: 1,
                        y: 1,
                        w: 1,
                        h: 1
                    }
                ]
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
            return map(this.level.objects, obj => {
                const { x, y, w, h } = obj;
                const style = {
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
    methods: {
        onEscape(ev) {},
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
        drawObjectBegin(ev) {
            if (this.draw_object === null) {
                const { x, y } = this.getMouseGridPoint(ev);
                this.draw_object_origin = { x, y };
                this.draw_object = this.addObject(x, y);
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
            const obj = { id, x, y, w, h };
            this.level.objects.push(obj);
            return obj;
        },
        selectObject(obj) {
            this.select_object = obj;
            console.log(this.select_object);
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
                    console.log(ev.keyCode);
                    break;
            }
        });
    }
});
