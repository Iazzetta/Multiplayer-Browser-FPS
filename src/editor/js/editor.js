import Vue from "./vue.js";

new Vue({
    el: "#editor",
    data() {
        return {
            grid: {
                cell_size: 32,
                rows: 16,
                cols: 16
            }
        };
    },
    computed: {
        gridStyle() {
            const { cols, rows, cell_size } = this.grid;
            return {
                width: cols * cell_size + "px",
                height: rows * cell_size + "px"
            };
        },
        cellStyle() {
            return {
                width: this.grid.cell_size - 2 + "px",
                height: this.grid.cell_size - 2 + "px"
            };
        }
    },
    methods: {

    }
});
