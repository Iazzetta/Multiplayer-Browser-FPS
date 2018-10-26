import * as THREE from "three";
import { Game } from "../client/js/game";
import { playerJoin, setMyPlayerId, loadLevel } from "../game/actions";
import { hitScan, toRadians } from "../game/utils";
import { WallEntity } from "../game/entities";

export class Editor extends Game {
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

        const [TAB, ESC, DEL, R] = [9, 27, 46, 82];

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
            const wall = this.createWall(id, mesh);
            this.state.addEntity(wall);
        }

        if (ev.keyCode === DEL) {
            if (this.activeTileId) {
                this.state.deleteEntity(this.activeTileId);
                this.activeTileId = null;
            }
        }

        if (ev.keyCode === R) {
            if (this.activeTileId) {
                const wall = this.state.getEntity(this.activeTileId);
                wall.tile.rotation.y += toRadians(90);

                const newWall = this.createWall(
                    wall.id,
                    wall.tile.type,
                    wall.object3D.position,
                    wall.tile.rotation
                );

                this.state.addEntity(newWall);
            }
        }
    }

    /**
     * @param {MouseEvent} ev
     */
    onMouseDown(ev) {
        super.onMouseDown(ev);

        if (ev.button === 2) {
            // Select
            const { playerModel } = this.myComponents;
            const hitscan = hitScan(
                playerModel.camera,
                this.state,
                this.activeTileId
            );
            if (hitscan.entity instanceof WallEntity) {
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

    exportLevelJson() {
        const tiles = this.state.getEntityGroup("wall").map(wall => {
            return {
                id: wall.id,
                type: wall.tile.type,
                rotation: wall.tile.rotation,
                position: wall.object3D.position
            };
        });

        return JSON.parse(JSON.stringify({ tiles }));
    }

    importLevelJson(level) {
        this.dispatch(loadLevel(level));

        const PLAYER_ID = "player-1";
        this.dispatch(playerJoin(PLAYER_ID, "editor"));
        this.dispatch(setMyPlayerId(PLAYER_ID));
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

    /**
     * @param {string} id
     * @param {string} tile
     * @param {THREE.Vector3} position
     * @param {THREE.Euler} rotation
     */
    createWall(
        id,
        tile,
        position = new THREE.Vector3(),
        rotation = new THREE.Euler()
    ) {
        return new WallEntity(id, this.state.assets, {
            tile,
            position,
            rotation
        });
    }

    runGame() {
        const level = this.exportLevelJson();

        this.destroy();
        setTimeout(() => {
            super.run("single-player");
            this.dispatch(loadLevel(level));
            this.dispatch(setMyPlayerId("player-1"));
            this.dispatch(playerJoin("player-1", "Player"));
            this.dispatch(playerJoin("player-2", "Enemy player"));
        }, 100);
    }

    runEditor() {
        this.destroy();
        setTimeout(() => {
            const PLAYER_ID = "player-1";
            this.dispatch(playerJoin(PLAYER_ID, "editor"));
            this.dispatch(setMyPlayerId(PLAYER_ID));

            const player = this.state.getEntity(PLAYER_ID);
            if (player && player.stats) {
                player.stats.runSpeed = 0.1;
            }

            const flor = this.createWall("flor", "tile_floor-lg");
            this.state.addEntity(flor);

            super.run("editor");
        }, 100);
    }

    run() {
        this.runEditor();
    }
}
