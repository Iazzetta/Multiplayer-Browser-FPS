import { Game } from "../client/js/game";
import { playerJoin, setMyPlayerId, spawnTileEntity } from "../game/actions";

const game = new Game();
game.loadAssets().then(() => {
    const PLAYER_ID = "player-1";
    game.dispatch(playerJoin(PLAYER_ID, "editor"));
    game.dispatch(setMyPlayerId(PLAYER_ID));
    game.dispatch(spawnTileEntity("flor", "tile_floor-lg"));
    game.run("editor");
});
