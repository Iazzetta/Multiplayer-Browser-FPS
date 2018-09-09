import { Game } from "./game.js";
import { initGame, setScreenSize } from "../game/actions.js";
import { loadAssets } from "./assets.js";

loadAssets().then(assets => {
    const game = new Game(assets);

    game.dispatch(initGame([game.playerId(), "dummy-player"]));

    requestAnimationFrame(function next() {
        game.update();
        game.render();
        requestAnimationFrame(next);
    });
});
