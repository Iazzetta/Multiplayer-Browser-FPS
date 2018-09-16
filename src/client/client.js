import { Game } from "./game.js";
import { initGame } from "../game/actions.js";

// @ts-ignore
import gun_sprite_img from "../assets/player-fps-weapon.png";
// @ts-ignore
import wall_tile_obj from "../assets/wall_tile.obj";
// @ts-ignore
import player_head_obj from "../assets/player_head.obj";
// @ts-ignore
import player_body_obj from "../assets/player_body.obj";

const game = new Game();
game.state.assets.loadImg("gun_sprite", gun_sprite_img);
game.state.assets.loadObj("wall_tile", wall_tile_obj);
game.state.assets.loadObj("player_head", player_head_obj);
game.state.assets.loadObj("player_body", player_body_obj);

game.state.assets.done().then(() => {
    game.dispatch(initGame([game.playerId(), "dummy-player"]));
    requestAnimationFrame(function next() {
        game.update();
        game.render();
        requestAnimationFrame(next);
    });
});
