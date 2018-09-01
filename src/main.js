import { Game } from "./game/game.js";
import { addPlayer } from "./game/actions.js";

const game = new Game();
game.initCamera();
game.initRenderer();
game.handleResize();

game.dispatch(addPlayer("PLAYER_1"));

requestAnimationFrame(function next() {
    game.render();
    requestAnimationFrame(next);
});
