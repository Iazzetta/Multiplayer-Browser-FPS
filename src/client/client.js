import { Game } from "./game.js";
import { initGame, setScreenSize } from "../game/actions.js";

const game = new Game();

game.dispatch(initGame([game.playerId(), "dummy-player"]));
game.dispatch(setScreenSize(window.innerWidth, window.innerHeight));

requestAnimationFrame(function next() {
    game.update();
    game.render();
    requestAnimationFrame(next);
});
