export const [PLAYER_SPAWN, WALL, AMMO_PACK, HEALTH_PACK] = [
    "player-spawn",
    "wall",
    "ammo-pack",
    "health-pack"
];

export const ObjTypes = Object.freeze({
    [PLAYER_SPAWN]: Object.freeze({
        color: "cornflowerblue"
    }),

    [WALL]: Object.freeze({
        color: "gray"
    }),

    [AMMO_PACK]: Object.freeze({
        color: "blue"
    }),

    [HEALTH_PACK]: Object.freeze({
        color: "green"
    })
});
