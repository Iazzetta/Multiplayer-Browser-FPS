import { Game } from "../game/game.js";
import { initGame, setScreenSize } from "../game/actions.js";
import SocketIO from "socket.io-client";

const socket = SocketIO("http://localhost:8080");
socket.on("connect", () => {
    console.log("Connected");

    socket.on("dispatch", action => {
        game.dispatch(action);
    });

    socket.on("disconnect", () => {
        console.log("Disconnect");
    });
});

const PLAYER_ID = "player-1";

const game = new Game();
game.initRenderer();
game.initMouseInput(PLAYER_ID);
game.initKeyboardInput(PLAYER_ID);

game.dispatch(initGame([PLAYER_ID]));
game.dispatch(setScreenSize(window.innerWidth, window.innerHeight));

requestAnimationFrame(function next(elapsed) {
    game.update(elapsed);
    game.render();
    requestAnimationFrame(next);
});
