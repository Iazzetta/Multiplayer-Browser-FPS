export const DEBUG = true;

export const PORT = "8080";

export const RESPAWN_TIME = 5000;

export const TILE_SIZE = 16;

export const JUMP_HEIGHT = 8;

export const JUMP_TIME = 1000;

export const GRAVITY = (2 * JUMP_HEIGHT) / Math.pow(JUMP_TIME * 0.5, 2);

export const JUMP_SPEED = GRAVITY * JUMP_TIME * 0.5;

export const RUN_SPEED = 0.02;

export const ASSETS_PATH = "/assets/";
