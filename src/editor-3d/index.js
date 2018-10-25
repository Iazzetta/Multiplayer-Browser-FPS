import * as THREE from "three";
import { Game } from "../client/js/game";
import { playerJoin, setMyPlayerId, spawnTileEntity } from "../game/actions";
import { hitScan } from "../game/utils";

class Editor extends Game {
    constructor() {
        super();
        this.activeTileId = Date.now().toString(16);
    }

    onMouseDown() {
        this.activeTileId = Date.now().toString(16);
        this.dispatch(spawnTileEntity(this.activeTileId, "tile_box-sm"));
    }

    onMouseMove(ev) {
        super.onMouseMove(ev);

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

                const getdirection = axis =>
                    (aabb.max[axis] === entry[axis] ? 1 : 0) +
                    (aabb.min[axis] === entry[axis] ? -1 : 0);

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
