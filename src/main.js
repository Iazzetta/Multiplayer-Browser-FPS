import { Game } from "./game/game.js";
import { initGame, setScreenSize } from "./game/actions.js";

const PLAYER_ID = "player-1";

const game = new Game();
game.initRenderer();

game.dispatch(initGame([PLAYER_ID]));
game.dispatch(setScreenSize(window.innerWidth, window.innerHeight));

requestAnimationFrame(function next(elapsed) {
    game.render();
    requestAnimationFrame(next);
});
