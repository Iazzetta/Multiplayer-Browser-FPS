export const [PLAYER_SPAWN, WALL, AMMO_PACK, HEALTH_PACK] = [
    "player",
    "wall",
    "ammo-pack",
    "health-pack"
];

export const ObjTypes = Object.freeze({
    [PLAYER_SPAWN]: Object.freeze({
        color: "cornflowerblue",
        is_point: true
    }),

    [WALL]: Object.freeze({
        color: "gray",
        is_point: false
    }),

    [AMMO_PACK]: Object.freeze({
        color: "blue",
        is_point: true
    }),

    [HEALTH_PACK]: Object.freeze({
        color: "green",
        is_point: true
    })
});
