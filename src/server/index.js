import express from "express";
import SocketIO from "socket.io";

const PORT = 8080;
const app = express();
const srv = app.listen(PORT);
app.use("/", express.static(__dirname + "/../../dist"));

const io = SocketIO.listen(srv);
io.sockets.on("connection", socket => {
    console.log("connection", socket.id);

    socket.on("disconnect", () => {
        console.log("disconnect", socket.id);
    });
});

console.log("Server running at http://localhost:" + PORT);
