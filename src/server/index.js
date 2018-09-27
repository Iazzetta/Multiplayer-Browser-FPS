import express from "express";
import SocketIO from "socket.io";
import { Game } from "../game/game";
import { PORT } from "../game/consts";
import debounce from "lodash/debounce";
import { initGame, kill, syncGameState } from "../game/actions";

// HTTP Server
//================================================================
const app = express();
const srv = app.listen(PORT);
app.use("/", express.static(__dirname + "/../../dist"));

{
    // Game
    //================================================================
    const io = SocketIO.listen(srv);
    const game = new Game();
    game.dispatch(initGame([]));
    game.subscriptions.push(action => {
        if (action.type === "SERVER_ACTION") {
            dispatch(action.data);
        }
    });

    const dispatch = action => {
        game.dispatch(action);
        io.sockets.emit("dispatch", action);
    };

    const syncGame = debounce(() => {
        console.log("Syncing players ...");
        const playerIds = Object.keys(io.sockets.connected);
        dispatch(syncGameState(playerIds));
    }, 1000);

    io.sockets.on("connection", socket => {
        console.log("Connection", socket.id);
        syncGame();

        socket.on("dispatch", action => {
            dispatch(action);
        });

        socket.on("disconnect", () => {
            dispatch(kill(socket.id));
            syncGame();
            console.log("Disconnect", socket.id);
        });
    });

    setInterval(() => {
        game.update();
        game.state.scene.updateMatrixWorld(true);
    }, 1000 / 60);

    console.log("Server running at http://localhost:" + PORT);
}
