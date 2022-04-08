import { LayerOrder, Level, LevelObject } from "../../RomInterfaces";
import { DrawInstruction } from "../tile-construction-tile-keys";
import { readAddressFromArray, readByteFromArray, readWord } from "../../binaryUtils/binary-io";
import { getStaticTileChunksByOffsets } from "./commonInstructions";

// 0x081be854
const BLUEROCKS_STATICS_ARRAY = 0x001be854;
// 0x081be884
const BLUEROCKS_LENGTHS_ARRAY = 0x001be884;

export function bigBlueRocks(lo: LevelObject, level: Level, romBuffer: Uint8Array): DrawInstruction[] {
    let ret: DrawInstruction[] = [];

    // Constant
    const offsetId = lo.objectId - 0xd4;
    const brStaticsAddr = readAddressFromArray(romBuffer,BLUEROCKS_STATICS_ARRAY,offsetId);

    const brLengthsAddr = readAddressFromArray(romBuffer,BLUEROCKS_LENGTHS_ARRAY,offsetId);

    let _overflow_max = 99;
    let _overflow = 0;
    let lengthIndex = 1;
    let prevLength = 0;

    while (_overflow < _overflow_max) {
        const length = readByteFromArray(romBuffer,brLengthsAddr,lengthIndex) + 0;
        if (length === 0) {
            break;
        }
        const curLength = length - prevLength;
        prevLength = length;
        for (let xIndex = 0; xIndex < curLength; xIndex++) {
            // You need to offset the previous values by length each time
            // Should start as zero, so subtract 1 from length index since it starts at 1
            const brStaticsValue = readWord(romBuffer, brStaticsAddr + (
                xIndex + (curLength * (lengthIndex-1))
            ) * 2);
            // For 0xDD, this is 0x0187, 0x9044, 0x79cc, 0x5b11, 0x904f
            //console.log("brStaticsValue", brStaticsValue.toString(16));
    
            const innerOffset = brStaticsValue % 0x100;
            ret.push({
                offsetX: xIndex,
                offsetY: lengthIndex - 1,
                uniqueLevelObjectId: lo.uuid,
                layer: LayerOrder.ROCKS,
                renderCodes: getStaticTileChunksByOffsets(romBuffer,brStaticsValue >> 8, innerOffset << 2)
            });
        }
        lengthIndex++;
        _overflow++;
        if (_overflow > _overflow_max) {
            console.error("Overflow when trying to get instructions for object:", lo);
            break;
        }
    }
    return ret;
}