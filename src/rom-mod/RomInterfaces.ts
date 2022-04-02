
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
 * **********************
 * ROM-RELATED INTERFACES
 * **********************
 */

/**
 * The fundamental object containing all info about a level or sublevel
 */
export interface Level {
    levelId: LevelDataOffset;
    /**
     * Note: This only applies to main levels. Sublevels do not have entrances,
     * their entrance is controlled by LevelExits
     */
    levelEntrance?: LevelEntrance;
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