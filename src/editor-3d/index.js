import * as THREE from "three";
import { Game } from "../client/js/game";
import { playerJoin, setMyPlayerId, spawnTileEntity } from "../game/actions";
import { hitScan } from "../game/utils";
import times from "lodash/times";
import { TileEntity } from "../game/entities";

class Editor extends Game {
    constructor() {
        super();
        this.activeTileId = Date.now().toString(16);
        this.tileIndex = 0;
        this.tiles = [
            "tile_box-sm",
            "tile_box-md",
            "tile_box-lg",
            "tile_wall-sm",
            "tile_wall-md",
            "tile_wall-lg",
            "tile_floor-sm",
            "tile_floor-lg",
            "tile_pillar-sm",
            "tile_pillar-md"
        ];
    }

    /**
     *
     * @param {KeyboardEvent} ev
     */
    onKeyDown(ev) {
        super.onKeyDown(ev);

        const [TAB, DEL] = [9, 46];

        if (ev.keyCode === TAB) {
            ev.preventDefault();
            ev.stopPropagation();

            if (this.activeTileId === null) {
                this.activeTileId = Date.now().toString(16);
            }

            this.tileIndex = this.tileIndex + 1;
            this.tileIndex = this.tileIndex % this.tiles.length;

            const id = this.activeTileId;
            const mesh = this.tiles[this.tileIndex];
            this.dispatch(spawnTileEntity(id, mesh));
        }

        if (ev.keyCode === DEL) {
            if (this.activeTileId) {
                this.state.deleteEntity(this.activeTileId);
                this.activeTileId = null;
            }
        }
    }

    /**
     * @param {MouseEvent} ev
     */
    onMouseDown(ev) {
        if (ev.button === 2) {
            // Select
            const { playerModel } = this.myComponents;
            const hitscan = hitScan(
                playerModel.camera,
                this.state,
                this.activeTileId
            );

            if (hitscan.entity instanceof TileEntity) {
                if (hitscan.entity.id !== "flor") {
                    this.activeTileId = hitscan.entity.id;
                }
            }
        } else {
            // Place tile
            this.activeTileId = null;
            this.tileIndex = 0;
        }
    }

    onMouseMove(ev) {
        super.onMouseMove(ev);
    }

    update() {
        super.update();

        const { playerModel } = this.myComponents;
        const hitscan = hitScan(
            playerModel.camera,
            this.state,
            this.activeTileId
        );

        if (hitscan.entity) {
            const tile = this.state.getEntity(this.activeTileId);
            if (tile && tile !== hitscan.entity) {
                const entry = new THREE.Vector3(...hitscan.point);

                const position = entry.clone();
                position.x = Math.round(position.x);
                position.y = Math.round(position.y);
                position.z = Math.round(position.z);

                const direction = new THREE.Vector3();
                const aabb = hitscan.entity.object3D.toAABB();

                const getdirection = axis => {
                    const p = Math.round(entry[axis] * 1000);
                    const max = Math.round(aabb.max[axis] * 1000);
                    const min = Math.round(aabb.min[axis] * 1000);
                    return (max === p ? 1 : 0) + (min === p ? -1 : 0);
                };

                direction.x = getdirection("x");
                direction.y = getdirection("y");
                direction.z = getdirection("z");

                const size = tile.object3D
                    .toAABB()
                    .size()
                    .multiplyScalar(0.5);

                position.x += direction.x * size.x;
                position.y += direction.y * size.y;
                position.z += direction.z * size.z;

                tile.object3D.position.copy(position);
            }
        }
    }

    run() {
        this.loadAssets().then(() => {
            const PLAYER_ID = "player-1";
            this.dispatch(playerJoin(PLAYER_ID, "editor"));
            this.dispatch(setMyPlayerId(PLAYER_ID));
            this.dispatch(spawnTileEntity("flor", "tile_floor-lg"));
            this.dispatch(spawnTileEntity(this.activeTileId, "tile_box-sm"));

            super.run("editor");
        });
    }
}

new Editor().run();
