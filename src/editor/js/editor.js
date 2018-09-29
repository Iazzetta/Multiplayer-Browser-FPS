import Vue from "./vue.js";

new Vue({
    el: "#editor",
    data() {
        return {
            grid: {
                cell_size: 24,
                rows: 16,
                cols: 16
            }
        };
    },
    computed: {
        gridRows(){
            return parseInt(this.grid.rows);
        },
        gridCols(){
            return parseInt(this.grid.cols);
        },
        cellStyle() {
            return {
                width: this.grid.cell_size + "px",
                height: this.grid.cell_size + "px"
            };
        }
    }
});
