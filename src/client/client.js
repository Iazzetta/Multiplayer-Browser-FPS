import { Game } from "./game.js";
import { Assets } from "../game/assets.js";
import { initGame, setScreenSize } from "../game/actions.js";
// @ts-ignore
import map1 from "../assets/map1.obj";

Assets.load({ map1 }).then(assets => {
    const game = new Game(assets);

    game.dispatch(initGame([game.playerId(), "dummy-player"]));
    game.dispatch(setScreenSize(window.innerWidth, window.innerHeight));

    requestAnimationFrame(function next() {
        game.update();
        game.render();
        requestAnimationFrame(next);
    });
});
