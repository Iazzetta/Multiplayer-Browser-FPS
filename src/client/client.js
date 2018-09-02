import { Game } from "./game.js";
import { initGame, setScreenSize } from "../game/actions.js";

const game = new Game();

game.dispatch(initGame([game.playerId()]));
game.dispatch(setScreenSize(window.innerWidth, window.innerHeight));

requestAnimationFrame(function next(elapsed) {
    game.update(elapsed);
    game.render();
    requestAnimationFrame(next);
});
