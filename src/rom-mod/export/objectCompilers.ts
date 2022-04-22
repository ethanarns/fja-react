import { LEVEL_HEADER_LENGTHS } from "../../GLOBALS";
import { readByteFromArray } from "../binaryUtils/binary-io";
import { LevelExit, LevelHeaders, LevelObject, LEVEL_HEADERS_KEY_LENGTH } from "../RomInterfaces";

export function static4sToArray(so: LevelObject): number[] {
    let retArray: number[] = [0,-1,-1,-1];
    retArray[3] = so.objectId;
    const y1 = so.yPos >> 4;
    const x1 = so.xPos >> 4;
    const y2 = so.yPos % 0x10;
    const x2 = so.xPos % 0x10;
    retArray[1] = y1*0x10 + x1; // y1x1
    retArray[2] = y2*0x10 + x2; // y2x2
    return retArray;
}

export function static4toArray(so: LevelObject): number[] {
    let retArray: number[] = [-1,-1,-1,-1];
    retArray[0] = so.objectId;
    const y1 = so.yPos >> 4;
    const x1 = so.xPos >> 4;
    const y2 = so.yPos % 0x10;
    const x2 = so.xPos % 0x10;
    retArray[1] = y1*0x10 + x1; // y1x1
    retArray[2] = y2*0x10 + x2; // y2x2
    retArray[3] = so.dimZ ? so.dimZ : 0;
    return retArray;
}

export function static5toArray(so: LevelObject): number[] {
    let retArray: number[] = [-1,-1,-1,-1,-1];
    retArray[0] = so.objectId;
    const y1 = so.yPos >> 4;
    const x1 = so.xPos >> 4;
    const y2 = so.yPos % 0x10;
    const x2 = so.xPos % 0x10;
    retArray[1] = y1*0x10 + x1; // y1x1
    retArray[2] = y2*0x10 + x2; // y2x2
    retArray[3] = so.dimX ? so.dimX : 0;
    retArray[4] = so.dimY ? so.dimY : 0;
    return retArray;
}

/**
 * Takes in LevelExits and outputs them in a format that the game understands.
 * Note that this may be 1 byte longer, since it automatically adds 0xff
 * 
 * Confirmed works on 1-1!
 * 
 * @param ls LevelExit[] array, usually taken from Level.exits
 * @returns A Number array representing bytes recreating the original storage
 */
export function compileLevelExitsToArray(ls: LevelExit[]): number[] {
    let res: number[] = [];
    for (let i = 0; i < ls.length; i++) {
        const lexit = ls[i];
        const exitArray = [
            lexit.screenExitValue,
            lexit.destinationLevelId,
            lexit.destinationXpos,
            lexit.destinationYpos,
            lexit.entryAnimation,
            lexit.unknown1,
            lexit.unknown2
        ];
        res = res.concat(exitArray);
    }
    return res.concat(0xff);
}

export function spriteToArray(sprite: LevelObject): number[] {
    if (sprite.objectType !== "sprite") {
        console.error("WARNING: Non-sprite LO passed to spriteToArray", sprite);
        return [];
    }
    let objArray: number[] = [-1,-1,-1,0];
    objArray[0] = sprite.objectId % 0x100; // Last 2
    const firstDigitId = Math.floor(sprite.objectId / 0x100); // This is either 0 or 1
    objArray[1] = (sprite.yPos << 1) + firstDigitId;
    objArray[2] = sprite.xPos;
    return objArray;
}

/**
 * Takes in the LevelHeader object, and outputs a byte array
 * 
 * @todo Do this with bit shifting, not string parsing
 * 
 * @param headers LevelHeaders, usually taken from LevelObject.headers
 * @param romBuffer Uint8Array
 * @returns number array representing the bytes generated
 */
export function compileLevelHeadersToArray(headers: LevelHeaders, romBuffer: Uint8Array): number[] {
    console.debug("Recompiling headers:", headers);
    let ret: number[] = [];
    if (!headers) {
        console.error("Headers to export are undefined");
        return [];
    }
    const headerKeys = Object.keys(headers);
    const headerValues: number[] = Object.values(headers);
    if (headerKeys.length !== LEVEL_HEADERS_KEY_LENGTH) {
        console.error("Bad number of header keys to export:", headerKeys.length);
        return [];
    }
    let headerIndexOffset = 0;
    let _killIndex = 0;
    // Ugh, fine, do a stupid hack
    let resString = "";
    const _killMax = LEVEL_HEADERS_KEY_LENGTH;
    do { // This terminates when the headerLength list reaches its nullterm of 0
        if (_killIndex > _killMax) {
            console.error("ERROR: Too many header keys!", _killIndex, headers);
            return [];
        }
        _killIndex++;
        const curHeaderLength = readByteFromArray(romBuffer,LEVEL_HEADER_LENGTHS,headerIndexOffset);
        if (curHeaderLength === undefined) {
            console.error("ERROR: curHeaderLength was undefined!");
            return [];
        }
        if (curHeaderLength !== 0) {
            const value = headerValues[headerIndexOffset];
            // You can do better than this man. Seriously.
            const binaryStr = value.toString(2).padStart(curHeaderLength,"0");
            resString += binaryStr;
        }
        headerIndexOffset++;
    } while(romBuffer[LEVEL_HEADER_LENGTHS+headerIndexOffset] !== 0);
    
    // Turn them into 8 bit/byte array
    for (let stringIndex = 0; stringIndex < resString.length; stringIndex += 8) {
        const strSlice = resString.slice(stringIndex,stringIndex + 8);
        ret.push(parseInt(strSlice,2));
    }
    return ret;
}