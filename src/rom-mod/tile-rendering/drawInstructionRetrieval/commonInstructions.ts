import { readAddressFromArray, readWordFromArray } from "../../binaryUtils/binary-io";
import { LayerOrder, LevelObject } from "../../RomInterfaces";
import { DrawInstruction } from "../tile-construction-tile-keys";

export function drawVerticalItemWithEnds(lo: LevelObject, top: string, middle: string, bottom: string, layer?: LayerOrder): DrawInstruction[] {
    let result: DrawInstruction[] = [];

    if (lo.dimZ === undefined) {
        console.error("No DimZ:",lo);
        return result;
    }
    // Length of zero means only source
    const length = lo.dimZ;
    const trueLayer = layer ? layer : LayerOrder.STANDARD_OBJECTS;

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

export function drawHorizontalItemWithEnds(lo: LevelObject, left: string, middle: string, right: string, layer?: LayerOrder): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    if (lo.dimZ === undefined) {
        console.error("No DimZ:",lo);
        return result;
    }
    // Length of zero means only source
    const length = lo.dimZ;
    const trueLayer = layer ? layer : LayerOrder.STANDARD_OBJECTS;

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

export function drawRepeatingRectangle(lo: LevelObject, chunkCodes: string, layer: LayerOrder = LayerOrder.STANDARD_OBJECTS): DrawInstruction[] {
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
                layer: layer,
                uniqueLevelObjectId: lo.uuid
            });
        }
    }
    return result;
}