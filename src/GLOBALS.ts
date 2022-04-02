export const CANVAS_HEIGHT = 600;
export const CANVAS_WIDTH = 800;

/**
 * 0xf6 and above are minigame sublevels, and work differently
 */
export const MAX_LEVEL_ENTRANCE_ID: number = 0xf5;

// 0x36 is the shy guy tube too many levels use
// 0x37 is the lantern ghost equivalent of 0x36
export const SKIP_RECURSION_LEVELS = [0x36, 0x37];

/**
 * Size: 1/2 the width of a standard coin (including its transparent sides),
 * or 1/2 the width of a poundable post, in pixels
 */
export const TILE_QUADRANT_DIMS_PX = 8;

/**
 * Size: the width of a standard coin (including its transparent sides),
 * or the width of a poundable post, in pixels
 */
export const FULL_TILE_DIMS_PX = 16;

export const PHASER_CANVAS_ID = "phaser-container";
export const SCENE_ID = "render-scene";

export const LEVEL_DATA_LIST_BASE_PTR = 0x001ef1a4;
export const LEVEL_DATA_OBJECT_OFFSET_LIST = 0x001c19d8;
export const LEVEL_SPRITES_BASE_PTR = 0x001ef57c;
export const MESSAGE_BASE_PTR = 0x002f5e18;
export const LEVEL_NAMES_BASE_PTR = 0x002f9888;
export const LEVEL_ENTRANCE_LIST_BASE_PTR = 0x001ef08c;
export const LEVEL_HEADER_LENGTHS = 0x00167766;

export const TILE_BYTES = 0x20; // 32