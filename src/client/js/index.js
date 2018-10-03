import { Game } from "./game";

const game = new Game();
game.loadAssets().then(() => {
    game.run();
});
