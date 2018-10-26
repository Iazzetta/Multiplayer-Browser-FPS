import { Game } from "./game";

const game = new Game();
game.loadAssets()
    .then(() => game.initSocket())
    .then(() => game.run("multiplayer"))
    .catch(() => game.run("single-player"))
