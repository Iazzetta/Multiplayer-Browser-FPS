import express from "express";
import SocketIO from "socket.io";
import { Game } from "../game/game";
import { PORT } from "../game/consts";
import {
    SERVER_ACTION,
    Action,
    playerJoin,
    playerLeave,
    syncGameState,
    loadLevel
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
    game.subscriptions.push(action => {
        if (action.type === SERVER_ACTION) {
            dispatch(action.data);
        }
    });

    // @ts-ignore
    const level = require("../../dist/assets/levels/level.json");
    game.dispatch(loadLevel(level));

    /**
     *
     * @param {Action} action
     * @param {SocketIO.Socket=} socket
     */
    function dispatch(action, socket) {
        game.dispatch(action);
        if (socket === undefined) {
            io.sockets.emit("dispatch", action);
        } else {
            socket.broadcast.emit("dispatch", action);
        }
    }

    io.sockets.on("connection", socket => {
        console.log("Connection", socket.id);

        socket.on("join", ({ name }) => {
            socket.emit("dispatch", loadLevel(level));
            dispatch(playerJoin(socket.id, name));
            dispatch(syncGameState(game.state));
            console.log(name + " joined");
        });

        socket.on("disconnect", () => {
            dispatch(playerLeave(socket.id));
            console.log("Disconnect", socket.id);
        });

        socket.on("dispatch", action => {
            dispatch(action, socket);
        });
    });

    setInterval(() => {
        game.update();
        game.state.scene.updateMatrixWorld(true);
    }, 1000 / 60);

    console.log("Server running at http://localhost:" + PORT);
}
