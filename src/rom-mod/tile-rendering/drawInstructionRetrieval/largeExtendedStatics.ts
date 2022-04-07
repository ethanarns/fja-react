import { LayerOrder, Level, LevelObject } from "../../RomInterfaces";
import { DrawInstruction } from "../tile-construction-tile-keys";
import { readAddressFromArray, readWord } from "../../binaryUtils/binary-io";
import { getStaticTileChunksByOffsets } from "./commonInstructions";

// 0x081be854
const BLUEROCKS_STATICS_ARRAY = 0x001be854;

export function bigBlueRocks(lo: LevelObject, level: Level, romBuffer: Uint8Array): DrawInstruction[] {
    let ret: DrawInstruction[] = [];

    // Constant
    const offsetId = lo.objectId - 0xd4;
    const brStaticsAddr = readAddressFromArray(romBuffer,BLUEROCKS_STATICS_ARRAY,offsetId);

    // Everything below here should be in some kind of block
    let brStaticsOffsetIndex = 0; // Find how this works
    const brStaticsValue = readWord(romBuffer, brStaticsAddr + brStaticsOffsetIndex * 2);

    const innerOffset = brStaticsValue % 0x100;
    ret.push({
        offsetX: 0,
        offsetY: 0,
        uniqueLevelObjectId: lo.uuid,
        layer: LayerOrder.STANDARD_OBJECTS,
        renderCodes: getStaticTileChunksByOffsets(romBuffer,brStaticsValue >> 8, (innerOffset << 2))
    });

    return ret;
}