import { Game } from "../game/game.js";
import { initGame, setScreenSize } from "../game/actions.js";
import SocketIO from "socket.io-client";

const game = new Game();
game.initSocket();
game.initRenderer();
game.initMouseInput();
game.initKeyboardInput();

game.dispatch(initGame([game.playerId()]));
game.dispatch(setScreenSize(window.innerWidth, window.innerHeight));

requestAnimationFrame(function next(elapsed) {
    game.update(elapsed);
    game.render();
    requestAnimationFrame(next);
});
