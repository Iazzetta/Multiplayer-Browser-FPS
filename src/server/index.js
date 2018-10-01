import express from "express";
import SocketIO from "socket.io";
import { Game } from "../game/game";
import { PORT } from "../game/consts";
import {
    SERVER_ACTION,
    playerJoin,
    playerLeave,
    syncAllPlayers,
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

    const dispatch = action => {
        game.dispatch(action);
        io.sockets.emit("dispatch", action);
    };

    io.sockets.on("connection", socket => {
        console.log("Connection", socket.id);

        socket.on("join", ({ name }) => {
            dispatch(playerJoin(socket.id, name));
            console.log(name + " joined");
        });

        socket.on("disconnect", () => {
            dispatch(playerLeave(socket.id));
            console.log("Disconnect", socket.id);
        });

        socket.on("dispatch", action => {
            dispatch(action);
        });
    });

    setInterval(() => {
        game.update();
        game.state.scene.updateMatrixWorld(true);
    }, 1000 / 60);

    console.log("Server running at http://localhost:" + PORT);
}
