import { LEVEL_DATA_LIST_BASE_PTR, LEVEL_ENTRANCE_LIST_BASE_PTR, LEVEL_HEADER_LENGTHS, LEVEL_NAMES_BASE_PTR, LEVEL_SPRITES_BASE_PTR, MAX_LEVEL_ENTRANCE_ID, SKIP_RECURSION_LEVELS } from "../GLOBALS";
import { readAddressFromArray } from "./binaryUtils/binary-io";
import { Level, LevelDataOffset, LevelEntrance, LevelHeaders, LevelObject, MainLevelDataOffset, ORDER_PRIORITY_SPRITE, RomData } from "./RomInterfaces";
import { getCombinedSpriteTiles } from "./binaryUtils/tile-utils";
import { CHAR_TABLE } from "./SMA3-CHARS";
import { getMainLevelDataOffsetByLevelIndex, getUuidv4 } from "../utility-functions";
import { getStaticObjectsAndExits } from "./binaryUtils/static-data-read";
import { getPaletteData } from "./tile-rendering/palette-data";

export function getRomDataFromBuffer(romBuffer: Uint8Array): RomData {
    const allLevels = loadAllLevelsFromRom(romBuffer);
    if (allLevels.length === 0 && allLevels.length > MAX_LEVEL_ENTRANCE_ID) {
        console.error("Unusual number of levels found:",allLevels.length);
    }
    let romData: RomData = {
        levels: allLevels
    };
    return romData;
}

/**
 * NOTE: Does not apply to sublevels! Those are controlled by exits
 * @param levelEntranceOffset 
 * @returns A LevelEntrance
 */
function readLevelEntrance(romBuffer: Uint8Array, levelEntranceOffset: number): LevelEntrance {
    const levelEntranceBasePtr = readAddressFromArray(romBuffer,LEVEL_ENTRANCE_LIST_BASE_PTR,levelEntranceOffset);
    let ret: LevelEntrance = {
        levelEntranceId: romBuffer[levelEntranceBasePtr+0], 
        startX: romBuffer[levelEntranceBasePtr+1],
        startY: romBuffer[levelEntranceBasePtr+2],
        iconToUnlockId: romBuffer[levelEntranceBasePtr+3],
        unknown5: romBuffer[levelEntranceBasePtr+4].toString(16).padStart(2,"0"),
        scrollType: romBuffer[levelEntranceBasePtr+5]
    };
    return ret;
}

/**
 * This applies to both sublevels and main levels
 * @param levelDataOffset LevelDataOffset
 * @returns Headers of the level
 */
function readLevelHeaders(romBuffer: Uint8Array, levelDataOffset: LevelDataOffset): LevelHeaders {
    const levelAddr = readAddressFromArray(romBuffer,LEVEL_DATA_LIST_BASE_PTR,levelDataOffset);
    let resultArray: number[] = [];

    let resultIndex = 0;
    let idy = 1;
    let uVar4 = 0;
    let headerIndexOffset = 0;
    let headerDataOffset = 0;
    do { // This terminates when the headerLength list reaches its nullterm of 0
        let idx = 0;
        if (romBuffer[LEVEL_HEADER_LENGTHS+headerIndexOffset] !== 0) {
            do {
                idy--;
                if (idy === 0) {
                    idy = 8;
                    let headerDataByte = romBuffer[levelAddr+headerDataOffset];
                    uVar4 = uVar4 | headerDataByte;
                    headerDataOffset++;
                }
                uVar4 = uVar4 << 1;
                idx++;
            } while (idx < romBuffer[LEVEL_HEADER_LENGTHS+headerIndexOffset]);
        }
        resultArray[resultIndex++] = (uVar4 >> 8);
        uVar4 = uVar4 & 0xff;
        headerIndexOffset++;
    } while(romBuffer[LEVEL_HEADER_LENGTHS+headerIndexOffset] !== 0);

    const lh: LevelHeaders = {
        backgroundColor: resultArray[0],
        tileset: resultArray[1],
        layer1palette: resultArray[2],
        layer2image: resultArray[3],
        layer2palette: resultArray[4],
        layer3type: resultArray[5],
        layer3palette: resultArray[6],
        spriteSet: resultArray[7],
        spritePalette: resultArray[8],
        layerOrderingProperty: resultArray[9],
        // index 10 is unknown
        // index 11 is unknown
        foregroundPosition: resultArray[12],
        music: resultArray[13],
        middleRingNumber: resultArray[14]      
    };
    return lh;
}

/**
 * This function loads a main level, ie one selected from the world map
 * It does NOT work for sublevels!
 * 
 * @param mainLevelDataOffset An offset used to find data for Main levels (not sublevels)
 * @param worldIndex Index of the world this level is from
 * @returns A Level
 */
function loadMainLevelByOffset(romBuffer: Uint8Array, mainLevelDataOffset: MainLevelDataOffset, worldIndex: number): Level {
    const levelEntrance = readLevelEntrance(romBuffer, mainLevelDataOffset);
    const headersStaticsAndExitsDataOffset: LevelDataOffset = levelEntrance.levelEntranceId;
    const headers = readLevelHeaders(romBuffer, headersStaticsAndExitsDataOffset);
    const levelTitle = readLevelName(romBuffer, mainLevelDataOffset);
    const spriteObjects: LevelObject[] = readSpriteObjects(romBuffer, headersStaticsAndExitsDataOffset);
    if (spriteObjects.length === 0) {
        console.warn(`Failed to load any sprite objects for level "${levelTitle}"`);
    }
    const mainLevelStaticData = getStaticObjectsAndExits(romBuffer,headersStaticsAndExitsDataOffset);
    const l: Level = {
        levelId: headersStaticsAndExitsDataOffset,
        objects: spriteObjects.concat(mainLevelStaticData.levelObjects),
        levelTitle: levelTitle,
        levelEntrance: levelEntrance,
        availableSpriteTiles: getCombinedSpriteTiles(romBuffer, headers.tileset),
        headers: headers,
        world: worldIndex,
        exits: mainLevelStaticData.exits,
        palettes: undefined
    }
    const palettes = getPaletteData(romBuffer,l);
    l.palettes = palettes;
    return l;
}

function readSpriteObjects(romBuffer: Uint8Array, levelOffset: number): LevelObject[] {
    let index = readAddressFromArray(romBuffer,LEVEL_SPRITES_BASE_PTR,levelOffset);
    if (index < 0) {
        console.warn(`Error in retrieving sprite object address for level offset "${levelOffset.toString(16).padStart(2)}"`);
        return [];
    }
    let levelSprites: LevelObject[] = [];
    for (let overflowIndex = 0; overflowIndex < 999; overflowIndex++) {
        // Ends with ff ff ff ff
        if (romBuffer[index] === 0xff && romBuffer[index+1] === 0xff) {
            //console.log(`Found ${levelSprites.length} dynamic objects`);
            if (levelSprites.length === 0) {
                console.warn("Zero dynamic objects retrieved!");
            }
            return levelSprites;
        }
        if (romBuffer[index+3] !== 0) {
            console.warn(
                `Warning: 4th byte of Dynamic objects should be 0, got ${
                    romBuffer[index+3]
                }`
            );
        }
        const last2digitsOfId = romBuffer[index];
        const byte2 = romBuffer[index+1]; // pull a lot of crap from this
        // Note: Shifting right one also deletes the rightmost digit
        let yPos = byte2 >> 1; // This is literally what it does in Ghidra
        let objectId = last2digitsOfId + (byte2 % 0b10 === 1 ? 0x100 : 0);
        let lo: LevelObject = {
            objectStorage: "4byte",
            objectType: "sprite",
            objectId: objectId,
            yPos: yPos,
            xPos: romBuffer[index+2],
            originalOffset16: "0x08" + index.toString(16),
            uuid: getUuidv4(),
            zIndex: ORDER_PRIORITY_SPRITE
        };
        //console.log(lo.originalOffset16,byte2.toString(2),(byte2 % 0b10000).toString(2).padStart(4,"0"),(byte2 % 0b10).toString(2));
        levelSprites.push(lo);
        index += 4;
    } // First byte2 is 0xE8, ID is 0x64, location is 0x081c2354
    console.error("Too many results found; missed end?");
    return [];
}

function loadAllLevelsFromRom(romBuffer: Uint8Array): Level[] {
    let levelsToLoad: Level[] = [];
    const NUM_WORLDS = 6;
    const NUM_LEVELS = 10;
    let usedLevelDataOffsets: LevelDataOffset[] = Object.assign([],SKIP_RECURSION_LEVELS);

    // Recursion subfunction
    const recurse: Function = (levelDataOffsetId: LevelDataOffset, worldIndex: number, limit:number) => {
        if (levelDataOffsetId > MAX_LEVEL_ENTRANCE_ID) {
            // It's a minigame, can't (and shouldn't) load
            return;
        }
        if (usedLevelDataOffsets.includes(levelDataOffsetId)) {
            // Checks if limit is 0, since that means its a main level
            return;
        }
        if (SKIP_RECURSION_LEVELS.includes(levelDataOffsetId)) {
            return;
        }
        if (limit > 5) {
            console.warn("Recursed very deep!");
            return;
        }
        limit++;
        const level = loadSubLevelByLevelDataOffset(romBuffer,levelDataOffsetId,worldIndex);
        levelsToLoad.push(level);
        usedLevelDataOffsets.push(levelDataOffsetId);
        for (let i = 0; i < level.exits.length; i++) {
            const exit = level.exits[i];
            recurse(exit.destinationLevelId,worldIndex,0);
        }
    } // End recursion subfunction

    for (let world = 0; world < NUM_WORLDS; world++) {
        for (let level = 0; level < NUM_LEVELS; level++) {
            const l = loadLevelByWorldAndLevelIndex(romBuffer, world,level);
            if (l) {
                levelsToLoad.push(l);
                usedLevelDataOffsets.push(l.levelEntrance!.levelEntranceId);
            } else {
                console.error(`Failed to load level before recursion`);
            }
        }
    }
    levelsToLoad.forEach(l => {
        for (let i = 0; i < l.exits.length; i++) {
            const exit = l.exits[i];
            recurse(exit.destinationLevelId,l.world,0);
        }
    });
    SKIP_RECURSION_LEVELS.forEach(skippedLevelId => {
        const skippedLevel = loadSubLevelByLevelDataOffset(romBuffer,skippedLevelId,0);
        levelsToLoad.push(skippedLevel);
    });

    return levelsToLoad;
}

function loadLevelByWorldAndLevelIndex(romBuffer: Uint8Array, currentWorld: number, currentLevel: number): Level | null {
    const mainLevelOffset: MainLevelDataOffset = getMainLevelDataOffsetByLevelIndex(currentWorld,currentLevel);
    const l = loadMainLevelByOffset(romBuffer, mainLevelOffset,currentWorld);
    return l;
}

/**
 * This retrieves the level name for main levels. Sublevels don't really have
 * these, which is why this uses the MainLevelDataOffset number
 * @param mainLevelDataOffset MainLevelDataOffset
 * @returns string representation of the title that shows at the level start
 */
function readLevelName(romBuffer: Uint8Array, mainLevelDataOffset: MainLevelDataOffset): string {
    const baseAddr = readAddressFromArray(romBuffer,LEVEL_NAMES_BASE_PTR,mainLevelDataOffset);
    let result = "";
    let i = 0;
    let debug = "";
    while (true) {
        const offsetDataSlice = romBuffer[baseAddr + i];
        if (offsetDataSlice === 0xfd) {
            break;
        } else if (offsetDataSlice === 0xd0) {
            result += " ";
            debug += offsetDataSlice.toString(16) + ",";
        } else if (offsetDataSlice === 0xf3) {
            result += ".";
        } else if ( romBuffer[baseAddr + i] === 0xfe) {
            // There may be other 3-byte commands, thus far just newline (0x10)
            if (romBuffer[baseAddr + i + 1] === 0x10) {
                result += "{\\n}";
                debug += offsetDataSlice.toString(16) + ",";
            } else {
                result += "";
                debug += romBuffer[baseAddr + i].toString(16) + ",";
            }
            i += 2;
        } else {
            result += CHAR_TABLE[romBuffer[baseAddr + i]];
            debug += romBuffer[baseAddr + i].toString(16) + ",";
        }
        if (i > 999) {
            console.error("String storage overflow");
            return "error";
        }
        i++;
    }
    console.debug("Level name debug:", debug);
    // Fix this
    result = result.replace("w@","w/");
    return result;
}

/**
 * This loads a sublevel by the offset that leads directly to header and static data
 * @param subLevelLevelDataOffset The offset that points to headers, statics, and exits
 * @returns A Level
 */
function loadSubLevelByLevelDataOffset(romBuffer: Uint8Array, subLevelLevelDataOffset: LevelDataOffset, worldIndex: number = 0): Level {;
    const headers = readLevelHeaders(romBuffer, subLevelLevelDataOffset);
    const title = `Sublevel 0x${subLevelLevelDataOffset.toString(16)}`;
    const spriteObjects: LevelObject[] = readSpriteObjects(romBuffer, subLevelLevelDataOffset);

    const mainLevelStaticData = getStaticObjectsAndExits(romBuffer,subLevelLevelDataOffset);
    const l: Level = {
        levelId: subLevelLevelDataOffset,
        objects: spriteObjects.concat(mainLevelStaticData.levelObjects),
        levelTitle: title,
        levelEntrance: undefined,
        availableSpriteTiles: getCombinedSpriteTiles(romBuffer, headers.tileset),
        headers: headers,
        world: worldIndex,
        exits: mainLevelStaticData.exits
    }
    const palettes = getPaletteData(romBuffer,l);
    l.palettes = palettes;
    return l;
}

/**
 * Given a list of levels to look through, and a LevelDataOffset ID, return a reference
 * to the level with that ID (if found)
 * @param levels Level array to search through
 * @param id The level's LevelDataOffset ID
 * @returns Level if found, undefined if 0 (or >1, in which case something is REALLY wrong)
 */
export function getLevelByOffsetId(levels: Level[], id: LevelDataOffset): Level | undefined {
    const levelRef = levels.filter(l => l.levelId === id);
    if (levelRef.length === 1) {
        return levelRef[0];
    } else {
        console.error(`One Level not found with id "${id}":`, levelRef);
        return undefined;
    }
}