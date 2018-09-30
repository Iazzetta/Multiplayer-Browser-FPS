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
            y: obj.y
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
        const nextPoint = {
            x: Math.floor(ev.layerX / this.tile_size),
            y: Math.floor(ev.layerY / this.tile_size)
        };

        if (this.dir.x !== 0) {
            obj.x = nextPoint.x;
        }

        if (this.dir.y !== 0) {
            obj.y = nextPoint.y;
        }
    }
}
