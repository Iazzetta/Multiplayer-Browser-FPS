import { Game } from "./game/Game.js";

const game = new Game();
game.initCamera();
game.initRenderer();
game.handleResize();

requestAnimationFrame(function next() {
    game.render();
    requestAnimationFrame(next);
});
