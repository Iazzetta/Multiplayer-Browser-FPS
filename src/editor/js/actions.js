export class ActionHandler {
    /**
     * @param {object} config
     * @param {number} config.tile_size
     */
    constructor(config) {
        this.tile_size = config.tile_size;
    }

    /**
     * @param {MouseEvent} ev
     * @param {object} obj
     */
    onMouseDown(ev, obj) {}

    /**
     * @param {MouseEvent} ev
     * @param {object} obj
     */
    onMouseMove(ev, obj) {}

    /**
     * @param {MouseEvent} ev
     * @param {object} obj
     */
    onMouseUp(ev, obj) {}
}

export class GrabAction extends ActionHandler {
    /**
     * @param {MouseEvent} ev
     * @param {object} obj
     */
    onMouseMove(ev, obj) {
        obj.x = Math.floor(ev.layerX / this.tile_size);
        obj.y = Math.floor(ev.layerY / this.tile_size);
        ev.stopPropagation();
        ev.preventDefault();
    }
}

export class ScaleAction extends ActionHandler {
    /**
     * @param {object} config
     * @param {object} obj
     * @param {{ x:number, y:number }} obj
     */
    constructor(config, obj, dir) {
        super(config);

        this.origin = {
            x: obj.x,
            y: obj.y,
            w: obj.w,
            h: obj.h
        };

        this.dir = {
            x: dir.x,
            y: dir.y
        };
    }

    /**
     * @param {MouseEvent} ev
     * @param {object} obj
     */
    onMouseMove(ev, obj) {
        const point = {
            x: Math.floor(ev.layerX / this.tile_size),
            y: Math.floor(ev.layerY / this.tile_size)
        };

        if (this.dir.y === 1) {
            obj.h = point.y - obj.y;
        }

        if (this.dir.y === -1) {
            obj.y = point.y + 1;
            obj.h = this.origin.y + this.origin.h - point.y - 1;
        }

        if (this.dir.x === 1) {
            obj.w = point.x - obj.x;
        }

        if (this.dir.x === -1) {
            obj.x = point.x + 1;
            obj.w = this.origin.x + this.origin.w - point.x - 1;
        }

        obj.w = Math.max(obj.w, 1);
        obj.h = Math.max(obj.h, 1);
    }
}
