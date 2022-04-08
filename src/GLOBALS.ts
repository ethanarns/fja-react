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
 * Mainly used for sizing TileChunks (8x8)
 */
export const TILE_QUADRANT_DIMS_PX = 8;

/**
 * Size: the width of a standard coin (including its transparent sides),
 * or the width of a poundable post, in pixels
 */
export const FULL_TILE_DIMS_PX = 16;

export const FULL_TILE_DIM_COUNT = 0xff;

export const DOM_CANVAS_ID = "dom-container";
export const SCENE_ID = "render-scene";
export const TILEMAP_ID = "base_tilemap";

export const LEVEL_DATA_LIST_BASE_PTR = 0x001ef1a4;
export const LEVEL_DATA_OBJECT_OFFSET_LIST = 0x001c19d8;
export const LEVEL_SPRITES_BASE_PTR = 0x001ef57c;
export const MESSAGE_BASE_PTR = 0x002f5e18;
export const LEVEL_NAMES_BASE_PTR = 0x002f9888;
export const LEVEL_ENTRANCE_LIST_BASE_PTR = 0x001ef08c;
export const LEVEL_HEADER_LENGTHS = 0x00167766;

export const TILE_BYTES = 0x20; // 32

export const WHITE_SQUARE_RENDER_CODE = "WHTE";
export const BLANK_SQUARE_RENDER_CODE = "BLNK";

// Palette crap
export const PALETTE_SPACER_LIST_PTR_MAYBE = 0x001671d8;
export const PALETTE_SPACER_DISTANCE_MAYBE = 6;
export const PALETTE_COMPRESSED_DATA_LIST_PTR = 0x002cf008;
export const PALETTE_LEVEL_BASE_PTR = 0x001a8d2e;
export const PALETTE_WORLD_LIST_BASE_PTR = 0x00164b7c;

// Controls
export const ARROW_MOVE_SPEED = FULL_TILE_DIMS_PX;