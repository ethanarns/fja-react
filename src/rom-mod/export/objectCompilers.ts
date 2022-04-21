import { LevelExit, LevelObject } from "../RomInterfaces";

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