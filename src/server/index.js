import express from "express";
import SocketIO from "socket.io";
import { Game } from "../game/game";
import { PORT } from "../game/consts";
import {
    initGame,
    SERVER_ACTION,
    playerJoin,
    playerLeave,
    spawnPlayer,
    syncAllPlayers
} from "../game/actions";
import { PlayerComponent } from "../game/components";

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

        socket.on("join", ({ name }) => {
            const id = socket.id;
            const playerData = new PlayerComponent({ id, name });
            dispatch(playerJoin(playerData));
            dispatch(syncAllPlayers(game.state));
            console.log(name + " joined");
        });

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
