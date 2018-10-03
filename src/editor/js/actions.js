import { ObjTypes } from "./object-types";

export class ActionHandler {
    /**
     * @param {object} config
     * @param {number} config.tile_size
     * @param {object} config.selectedObj
     */
    constructor(config) {
        const obj = config.selectedObj || {};
        this.tile_size = config.tile_size;
        this.origin = {
            x: obj.x || 0,
            y: obj.y || 0,
            w: obj.w || 0,
            h: obj.h || 0
        };
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

ActionHandler.Empty = function() {
    return new ActionHandler({ tile_size: 0, selectedObj: null });
};

export class GrabAction extends ActionHandler {
    constructor(config) {
        super(config);
        this.offset = { x: 0, y: 0 };
    }

    /**
     * @param {MouseEvent} ev
     * @param {object} obj
     */
    onMouseDown(ev, obj) {
        this.offset.x = ev.layerX;
        this.offset.y = ev.layerY;
    }

    /**
     * @param {MouseEvent} ev
     * @param {object} obj
     */
    onMouseMove(ev, obj) {
        const point = {
            x: Math.floor((ev.layerX - this.offset.x) / this.tile_size),
            y: Math.floor((ev.layerY - this.offset.y) / this.tile_size)
        };

        obj.x = point.x;
        obj.y = point.y;
        ev.stopPropagation();
        ev.preventDefault();
    }
}

export class ScaleAction extends ActionHandler {
    /**
     * @param {object} config
     * @param {{ x:number, y:number }} dir
     */
    constructor(config, dir) {
        super(config);
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

        if (ObjTypes[obj.type].is_point) {
            if (this.dir.y !== 0) {
                obj.y = point.y;
            }
            if (this.dir.x !== 0) {
                obj.x = point.x;
            }
            return;
        }

        if (this.dir.y === 1) {
            obj.h = point.y - obj.y;
        }

        if (this.dir.x === 1) {
            obj.w = point.x - obj.x;
        }

        if (this.dir.y === -1) {
            if (point.y + 1 > this.origin.y + this.origin.h - 1) {
                return;
            }
            obj.y = point.y + 1;
            obj.h = this.origin.y + this.origin.h - point.y - 1;
        }

        if (this.dir.x === -1) {
            if (point.x + 1 > this.origin.x + this.origin.w - 1) {
                return;
            }
            obj.x = point.x + 1;
            obj.w = this.origin.x + this.origin.w - point.x - 1;
        }

        obj.w = Math.max(obj.w, 1);
        obj.h = Math.max(obj.h, 1);
    }
}
