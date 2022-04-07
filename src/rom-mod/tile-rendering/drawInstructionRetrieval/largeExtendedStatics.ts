import { Level, LevelObject } from "../../RomInterfaces";
import { DrawInstruction } from "../tile-construction-tile-keys";
import { readAddressFromArray, readWord } from "../../binaryUtils/binary-io";
import { getStaticChunkCodeByOffsets } from "./commonInstructions";

// 0x081be854
const BLUEROCKS_STATICS_ARRAY = 0x001be854;

export function bigBlueRocks(lo: LevelObject, level: Level, romBuffer: Uint8Array): DrawInstruction[] {
    let ret: DrawInstruction[] = [];

    const offsetId = lo.objectId - 0xd4;
    const brStaticsAddr = readAddressFromArray(romBuffer,BLUEROCKS_STATICS_ARRAY,offsetId);
    let brStaticsOffsetIndex = 0; // Find how this works
    const brStaticsValue = readWord(romBuffer, brStaticsAddr + brStaticsOffsetIndex * 2);

    const innerOffset = brStaticsValue % 0x100;
    const chunkCode = getStaticChunkCodeByOffsets(romBuffer,brStaticsValue >> 8, innerOffset << 2);
    console.log(chunkCode);

    return ret;
}