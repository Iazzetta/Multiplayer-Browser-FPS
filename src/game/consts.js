export const DEBUG = false;

export const TILE_SIZE = 12;

export class WEAPON_TYPE {
    /**
     * @param {object} config
     * @param {string} config.name
     * @param {number} config.damage
     * @param {number} config.firerate
     * @param {number} config.reloadSpeed
     * @param {number} config.maxLoadedAmmo
     * @param {number} config.maxReservedAmmo
     */
    constructor(config) {
        this.name = config.name;
        this.damage = config.damage;
        this.firerate = config.firerate;
        this.reloadSpeed = config.reloadSpeed;
        this.maxLoadedAmmo = config.maxLoadedAmmo;
        this.maxReservedAmmo = config.maxReservedAmmo;
    }
}

WEAPON_TYPE.MACHINEGUN = Object.freeze(
    new WEAPON_TYPE({
        name: "machine-gun",
        damage: 1,
        firerate: 100,
        reloadSpeed: 2000,
        maxLoadedAmmo: 24,
        maxReservedAmmo: 100
    })
);
