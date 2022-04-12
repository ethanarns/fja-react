import "../../utility-functions"
import { LevelExit, LevelObject } from "../RomInterfaces";
import { LEVEL_DATA_LIST_BASE_PTR, LEVEL_DATA_OBJECT_OFFSET_LIST } from "../../GLOBALS";
import { readAddressFromArray, readByteFromArray } from "./binary-io";
import { getUuidv4 } from "../../utility-functions";

export interface StaticObjectsAndExits {
    levelObjects: LevelObject[];
    exits: LevelExit[];
}

export function getStaticObjectsAndExits(romBuffer: Uint8Array, levelEntranceId: number): StaticObjectsAndExits {
    const levelAddr = readAddressFromArray(romBuffer,LEVEL_DATA_LIST_BASE_PTR,levelEntranceId);
    let ret: StaticObjectsAndExits = {
        levelObjects: [],
        exits: []
    };
    if (levelAddr < 0) {
        console.warn(`Error in retrieving static object address for level entrance ID "${levelEntranceId.toString(16).padStart(2)}"`);
        return ret;
    }

    let index = levelAddr + 10; // Skip the header
    let levelObjects: LevelObject[] = [];
    let zIndex = 0;
    for (let overflowIndex = 0; overflowIndex < 9999; overflowIndex++) {
        let curLevelObject: LevelObject = {
            objectId: -1,
            objectType: "static",
            objectStorage: "5byte",
            xPos: -1,
            yPos: -1,
            originalOffset16: "0x08" + index.toString(16),
            uuid: getUuidv4(),
            zIndex: zIndex++
        };
        if (romBuffer[index] === 0xff) {
            //console.log(`Read ${levelObjects.length} objects`);
            if (levelObjects.length === 0) {
                console.error("Read zero static objects!");
            }
            ret.exits = getLevelExits(romBuffer,index + 1);
            ret.levelObjects = levelObjects;
            return ret;
        }
        // Special 4 byte object
        if (romBuffer[index] === 0) {
            // +1 and +2 are location
            curLevelObject.objectStorage = "s4byte"
            // Last byte is ID
            curLevelObject.objectId = romBuffer[index+3];
            // No dimensions
        } else {
            curLevelObject.objectId = romBuffer[index];
            const offsetValue = readByteFromArray(
                romBuffer,
                LEVEL_DATA_OBJECT_OFFSET_LIST,
                curLevelObject.objectId
            );
            if ((offsetValue & 3) === 0 || (offsetValue & 3) === 1) {
                // Standard 4 byte
                curLevelObject.objectStorage = "4byte";
                // +1 and +2 are location, only 1 "length", can do any dir
                curLevelObject.dimZ = romBuffer[index+3];
            } else {
                // Standard 5 byte
                curLevelObject.objectStorage = "5byte"
                // +1 and +2 are location, has both height and width dims
                curLevelObject.dimX = romBuffer[index+3];
                curLevelObject.dimY = romBuffer[index+4];
            }
        }
        let y1 = romBuffer[index+1] >> 4;
        let y2 = romBuffer[index+2] >> 4;
        let x1 = romBuffer[index+1] % 0x10;
        let x2 = romBuffer[index+2] % 0x10;
        curLevelObject.yPos = (y1 << 4) + y2;
        curLevelObject.xPos = (x1 << 4) + x2;
        
        // Finally, push the object
        levelObjects.push(curLevelObject);
        if (curLevelObject.objectStorage === "5byte") {
            index += 5;
        } else {
            index += 4;
        }
    }
    console.error("Object pull overflow!!");
    return {
        levelObjects: [],
        exits: []
    };
}

/**
 * Get level exits
 * @returns A list of all the level exits from the previously loaded level
 */
function getLevelExits(romBuffer: Uint8Array, index: number): LevelExit[] {
    let ret: LevelExit[] = [];
    let foundFF = false;
    while(!foundFF) {
        const le: LevelExit = {
            screenExitValue: romBuffer[index+0],
            destinationLevelId: romBuffer[index+1],
            destinationXpos: romBuffer[index+2],
            destinationYpos: romBuffer[index+3],
            entryAnimation: romBuffer[index+4],
            unknown1: romBuffer[index+5],
            unknown2: romBuffer[index+6]
        }
        ret.push(le);
        index += 7;
        if (romBuffer[index] === 0xff) {
            foundFF = true;
        }
    }
    return ret;
}