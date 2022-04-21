import { readAddressFromArray, readWord, readWordFromArray } from "../../binaryUtils/binary-io";
import { LevelObject } from "../../RomInterfaces";
import { DrawInstruction } from "../tile-construction-tile-keys";

export function drawVerticalItemWithEnds(lo: LevelObject, top: string, middle: string, bottom: string): DrawInstruction[] {
    let result: DrawInstruction[] = [];

    if (lo.dimZ === undefined) {
        console.error("No DimZ:",lo);
        return result;
    }
    // Length of zero means only source
    const length = lo.dimZ;
    const trueLayer = lo.zIndex;

    // Top
    result.push({
        offsetX:0,
        offsetY:0,
        uniqueLevelObjectId: lo.uuid,
        layer: trueLayer,
        renderCodes: top
    });
    // Bottom
    if (length > 0) {
        result.push({
            offsetX:0,
            offsetY:length,
            uniqueLevelObjectId: lo.uuid,
            layer: trueLayer,
            renderCodes: bottom
        });
    }
    // In-between
    if (length > 1) {
        for (let i = 1; i < length; i++) {
            result.push({
                offsetX:0,
                offsetY:i,
                uniqueLevelObjectId: lo.uuid,
                layer: trueLayer,
                renderCodes: middle
            });
        }
    }

    return result
}

export function drawHorizontalItemWithEnds(lo: LevelObject, left: string, middle: string, right: string): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    if (lo.dimZ === undefined) {
        console.error("No DimZ:",lo);
        return result;
    }
    // Length of zero means only source
    const length = lo.dimZ;
    const trueLayer = lo.zIndex;

    // Do source
    result.push({
        offsetX:0,
        offsetY: 0,
        uniqueLevelObjectId: lo.uuid,
        layer: trueLayer,
        renderCodes: left
    });
    // Do end if greater than 0
    if (length > 0) {
        result.push({
            offsetX:length,
            offsetY:0,
            uniqueLevelObjectId: lo.uuid,
            layer: trueLayer,
            renderCodes: right
        });
    }
    // Do betweens if more than 2 tiles
    if (length > 1) {
        for (let i = 1; i < length; i++) {
            result.push({
                offsetX:i,
                offsetY:0,
                uniqueLevelObjectId: lo.uuid,
                layer: trueLayer,
                renderCodes: middle
            });
        }
    }
    return result;
}

export function getStaticChunkCodeByOffsets(rom: Uint8Array, offset1: number, offset2: number): string {
    //                                   0x081bad20
    const OBJECT_TILES_AND_PARAMS_BASE = 0x001bad20;
    const paramsArrayBase = readAddressFromArray(rom,OBJECT_TILES_AND_PARAMS_BASE,offset1);
    const paramNum = readWordFromArray(rom,paramsArrayBase,offset2);
    return paramNum.toString(16).padStart(4,"0");
}

export function getStaticTileChunksByOffsets(rom: Uint8Array, offset1: number, offset2: number): string {
    const chunkCode0 = getStaticChunkCodeByOffsets(rom, offset1, offset2 + 0);
    const chunkCode1 = getStaticChunkCodeByOffsets(rom, offset1, offset2 + 1);
    const chunkCode2 = getStaticChunkCodeByOffsets(rom, offset1, offset2 + 2);
    const chunkCode3 = getStaticChunkCodeByOffsets(rom, offset1, offset2 + 3);
    return `${chunkCode0},${chunkCode1},${chunkCode2},${chunkCode3}`;
}

export function drawRepeatingRectangle(lo: LevelObject, chunkCodes: string): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    if (lo.dimX === undefined || lo.dimY === undefined) {
        console.error("LevelObject does not have 2D dimensions:", lo);
        return result;
    }
    for (let y = 0; y < lo.dimY+1; y++) {
        for (let x = 0; x < lo.dimX+1; x++) {
            result.push({
                offsetX: x,
                offsetY: y,
                renderCodes: chunkCodes,
                layer: lo.zIndex,
                uniqueLevelObjectId: lo.uuid
            });
        }
    }
    return result;
}

/**
 * Takes in a single tile code, and generates 4 from it
 * @param romBuffer Uint8Array
 * @param tileCode number, 2byte/word, stored in 0x02...
 */
 export function getTileRenderCodesFromTilecode(romBuffer: Uint8Array, tileCode: number): string {
    const STATIC_TILES_BASE = 0x001bad20; // 081bad20
    // << 2 multiplies it by 4 so it offsets the address right
    // let firstOffset = (tileCode >> 0x8) << 0x2;
    const paramArrayAddr = readAddressFromArray(romBuffer, STATIC_TILES_BASE, tileCode >> 0x8);

    const paramsOffset = (tileCode % 0x100) << 0x3;
    const firstWord = readWord(romBuffer,paramArrayAddr + paramsOffset).toString(16);
    const second = readWord(romBuffer,paramArrayAddr + paramsOffset + 2).toString(16);
    const third = readWord(romBuffer,paramArrayAddr + paramsOffset + 4).toString(16);
    const fourth = readWord(romBuffer,paramArrayAddr + paramsOffset + 6).toString(16);
    return `${
        firstWord.padStart(4,"0")
    },${
        second.padStart(4,"0")
    },${
        third.padStart(4,"0")
    },${
        fourth.padStart(4,"0")
    }`;
}

export function getFixedDimsObject(lo: LevelObject, tileCodes: number[], height: number, width: number, romBuffer: Uint8Array): DrawInstruction[] {
    if (tileCodes.length !== height * width) {
        console.error("Tile codes list does not fit with fixed height/width",tileCodes,lo);
        return [];
    }
    let ret: DrawInstruction[] = [];
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const index = y*width + x;
            ret.push({
                offsetX: x,
                offsetY: y,
                renderCodes: getTileRenderCodesFromTilecode(romBuffer,tileCodes[index]),
                layer: lo.zIndex,
                uniqueLevelObjectId: lo.uuid
            });
        }
    }
    return ret;
}