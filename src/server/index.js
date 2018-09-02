import express from "express";

const app = express();
const srv = app.listen(8080);
app.use("/", express.static(__dirname + "/../dist/"));
