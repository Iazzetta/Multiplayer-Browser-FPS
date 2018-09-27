import express from "express";
import SocketIO from "socket.io";
import { Game } from "../game/game";
import { PORT } from "../game/consts";
import debounce from "lodash/debounce";
import {
    initGame,
    SERVER_ACTION,
    playerJoin,
    playerLeave,
    spawnPlayer,
    syncAllPlayers
} from "../game/actions";

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
    game.dispatch(initGame());
    game.subscriptions.push(action => {
        if (action.type === SERVER_ACTION) {
            dispatch(action.data);
        }
    });

    const dispatch = action => {
        game.dispatch(action);
        io.sockets.emit("dispatch", action);
    };

    io.sockets.on("connection", socket => {
        console.log("Connection", socket.id);
        dispatch(playerJoin(socket.id));
        dispatch(syncAllPlayers(game.state));

        setTimeout(() => {
            dispatch(spawnPlayer(socket.id));
        }, 1000);

        socket.on("dispatch", action => {
            dispatch(action);
        });

        socket.on("disconnect", () => {
            dispatch(playerLeave(socket.id));
            console.log("Disconnect", socket.id);
        });
    });

    setInterval(() => {
        game.update();
        game.state.scene.updateMatrixWorld(true);
    }, 1000 / 60);

    console.log("Server running at http://localhost:" + PORT);
}
