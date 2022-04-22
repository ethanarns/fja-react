import { Level } from "../RomInterfaces";
import { compileLevelExitsToArray, compileLevelHeadersToArray, spriteToArray, static4sToArray, static4toArray, static5toArray } from "./objectCompilers";

export interface CompiledLevel {
    primaryLevelData: number[];
    sprites: number[];
}

export function compileLevelData(level: Level, romBuffer: Uint8Array): CompiledLevel {
    const headerArray = compileLevelHeadersToArray(level.headers, romBuffer);
    const exitsArray = compileLevelExitsToArray(level.exits);
    const spritesArray = compileSpritesToArray(level);
    const staticObjects = compileStaticstoArray(level);
    const primaryLevelData = headerArray.concat(staticObjects).concat(exitsArray);
    return {
        primaryLevelData: primaryLevelData,
        sprites: spritesArray
    };
}

function compileSpritesToArray(level: Level): number[] {
    let ret: number[] = [];
    const objects = level.objects.filter(lo => lo.objectType === "sprite");
    for (let objIndex = 0; objIndex < objects.length; objIndex++) {
        const curSpriteObj = objects[objIndex];
        const curSpriteArray = spriteToArray(curSpriteObj);
        if (!curSpriteArray) {
            console.error("Invalid sprite array!",curSpriteArray,curSpriteObj);
        } else {
            ret = ret.concat(curSpriteArray);
        }
    }
    ret = ret.concat([0xff,0xff,0xff,0xff]);
    return ret;
}

function compileStaticstoArray(level: Level): number[] {
    let ret: number[] = [];
    const objects = level.objects.filter(lo => lo.objectType === "static");
    if (!objects) {
        console.warn("No statics to compile!",objects,level);
    }
    for (let objIndex = 0; objIndex < objects.length; objIndex++) {
        const curStaticObject = objects[objIndex];
        if (curStaticObject.objectStorage === "s4byte") {
            ret = ret.concat(static4sToArray(curStaticObject));
        } else if (curStaticObject.objectStorage === "4byte") {
            ret = ret.concat(static4toArray(curStaticObject));
        } else if (curStaticObject.objectStorage === "5byte") {
            ret = ret.concat(static5toArray(curStaticObject));
        } else {
            console.error("Unknonw storage type:",curStaticObject.objectStorage);
        }
    }
    ret = ret.concat(0xff);
    return ret;
}