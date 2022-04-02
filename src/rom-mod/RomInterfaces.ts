
/**
 * ******************
 * BASIC TYPE RENAMES
 * ******************
 */

/**
 * This is only used for main levels, not sublevels, and is used for the following:
 * - Level name offset
 * - Level entrance offset
 */
export type MainLevelDataOffset = number;
/**
 * This applies to both main and sublevels, and is used for the following:
 * - Offset to find level headers
 * - Offset to find level static objects (note: 10 bytes after headers)
 * - Offset to find level exits (note: at end of level statics list)
 */
export type LevelDataOffset = number;

export type TilePixelData = number[];

export type ObjectStorageType = "4byte" | "s4byte" | "5byte";
export type LevelObjectType = "static" | "sprite";

/**
 * ******************
 * ENUMS AND ORDERING
 * ******************
 */

/**
 * How the camera scrolls
 * This is used when loading a LevelEntrance
 * @see LevelEntrance
 */
export enum ScrollType {
    FREE_SCROLLING = 0,
    NO_SCROLLING = 3
}

/**
 * Helps order things when rendering
 */
export enum LayerOrder {
    /**
     * Things like highlighting and selection
     */
    GUI = 15,
    /**
     * Sprites, formerly known as Dynamics, will always go over static objects
     */
    SPRITES = 10,

    BREAKABLE_ROCK_WIPE = 7.1,
    BREAKABLE_ROCK = 7,

    /**
     * Stuff like Pipes, 
     */
    STANDARD_OBJECTS = 1,
}

/**
 * Ones above 0xA are theorized to be Bandit Minigames, but
 * seem to fail when using pipes to go
 */
export enum LevelEntryAnimation {
    FALL = 0x0,
    ON_SKIS = 0x1,
    RIGHT_FROM_PIPE = 0x2,
    LEFT_FROM_PIPE = 0x3,
    DOWN_FROM_PIPE = 0x4,
    UP_FROM_PIPE = 0x5,
    GO_RIGHT = 0x6,
    GO_LEFT = 0x7,
    GO_DOWN = 0x8,
    JUMP_HIGH = 0x9,
    SHOT_TO_MOON = 0xA,
    _TRANSFER_TO_MAP = 0xB,
    _CRASH1 = 0xC,
    _CRASH2 = 0xD
}



/**
 * **********************
 * ROM-RELATED INTERFACES
 * **********************
 */

/**
 * The fundamental object containing all info about a level or sublevel
 */
 export interface Level {
    /**
     * LevelDataOffset
     */
    levelId: LevelDataOffset;
    objects: LevelObject[];
    levelTitle: string;
    /**
     * Note: This only applies to main levels. Sublevels do not have entrances,
     * their entrance is controlled by LevelExits
     */
    levelEntrance?: LevelEntrance;
    availableSpriteTiles: TilePixelData[]; // Access via index
    headers: LevelHeaders;
    world: number;
    exits: LevelExit[];
}

/**
 * Represents a single level exit, of which there can be many in levels
 * How it works: The screenExitValue applies a section of the level as
 * a Screen Exit "page", in which every passage in the section leads to the
 * level ID in question.
 * 
 * Note that this means you can only have 1 entrance in each section
 * @todo Make check to see if multiple entrances in one screen page seciton
 */
 export interface LevelExit {
    /**
     * Example: 0x75 -> page y = 7, x = 5
     * You can't really convert this to coords since one page has
     * 0xf*0xf possible coordinates in it. Only reverse
     * @see `getScreenPageFromCoords` method in RomService to calculate
     */
    screenExitValue: number;
    /**
     * LevelEntrance ID, NOT LevelName ID
     */
    destinationLevelId: number;
    /**
     * X position of where you show up in the next level?
     */
    destinationXpos: number;
    /**
     * Y position of where you show up in the next level?
     */
    destinationYpos: number;
    /**
     * The animation that plays when entering the second level
     * 
     * This might also be used for bandit minigames
     */
    entryAnimation: LevelEntryAnimation;
    /**
     * Unknown
     */
    unknown1: number;
    /**
     * Unknown, seems to affect the camera
     */
    unknown2: number;
}

export interface LevelObject {
    objectType: LevelObjectType;
    objectStorage: ObjectStorageType;
    objectId: number;
    dimX?: number;
    dimY?: number;
    dimZ?: number;
    xPos: number;
    yPos: number;
    originalOffset16?: string;
    uuid: string;
}

/**
 * Note: These only apply to main levels. Sub level entries are controlled with
 * LevelExits
 */
export interface LevelEntrance {
    /**
     * This points to the headers, statics, and exits
     */
    levelEntranceId: LevelDataOffset;
    startX: number;
    startY: number;
    iconToUnlockId: number;
    unknown5: string;
    scrollType: ScrollType;
}

/**
 * Will contain more and more as things become supported
 * Hint block text?
 */
export interface RomData {
    levels: Level[];
}

export interface LevelHeaders {
    backgroundColor: number; // See if this is a special object and not an index
    /**
     * The tileset available for the level.
     * @see TILESET_NAME for descriptions
     */
    tileset: number;
    layer1palette: number;
    layer2image: number;
    layer2palette: number;
    layer3type: number;
    layer3palette: number;
    spriteSet: number;
    spritePalette: number;
    layerOrderingProperty: number;
    foregroundPosition: number;
    music: number;
    middleRingNumber: number;
}