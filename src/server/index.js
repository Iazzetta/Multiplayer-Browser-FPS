import express from "express";

const PORT = 8080;
const app = express();
const srv = app.listen(PORT);
app.use("/", express.static(__dirname + "/../../dist"));

console.log("Server running at http://localhost:" + PORT);
