import { Level, LevelObject } from "../../RomInterfaces";
import { DrawInstruction } from "../tile-construction-tile-keys";
import { readAddress, readAddressFromArray, readWord } from "../../binaryUtils/binary-io";

// 0x081be854
const BLUEROCKS_STATICS_ARRAY = 0x001be854;
// 0x0081bad20
const OBJECT_TILES_AND_PARAMS_BASE = 0x001bad20;

export function bigBlueRocks(lo: LevelObject, level: Level, romBuffer: Uint8Array): DrawInstruction[] {
    let ret: DrawInstruction[] = [];

    // Should be 0x9
    const offsetId = lo.objectId - 0xd4;
    console.log("offsetId",offsetId);
    // Should be 0x24
    // const offsetId4 = offsetId << 2;
    // // 0x081be854 + 0x24
    // const offsetAddr = BLUEROCKS_STATICS_ARRAY + offsetId4;
    const brStaticsAddr = readAddressFromArray(romBuffer,BLUEROCKS_STATICS_ARRAY,offsetId);
    console.log("brStaticsAddr",brStaticsAddr.toString(16));
    let brStaticsOffsetIndex = 0;
    // Should be 0x0817
    const brStaticsValue = readWord(romBuffer, brStaticsAddr + brStaticsOffsetIndex * 2);
    console.log("brStaticsValue",brStaticsValue.toString(16));
    // Do this manually for now because dumb
    const objTilesOffset = brStaticsValue >> 6;
    const objTilesBlueRockBaseOffsetAddr = OBJECT_TILES_AND_PARAMS_BASE + objTilesOffset;
    console.log("objTilesBlueRockBaseOffset",objTilesBlueRockBaseOffsetAddr.toString(16));

    const trueObjectTilesBase = readAddress(romBuffer,objTilesBlueRockBaseOffsetAddr);
    console.log("trueObjectTilesBase", trueObjectTilesBase.toString(16));

    // Should be 0x17
    const innerOffset = brStaticsValue % 0x100;
    console.log("innerOffset",innerOffset.toString(16));

    const trueObjectParamsLocation = trueObjectTilesBase + (innerOffset << 3);
    console.log("trueObjectParamsLocation",trueObjectParamsLocation.toString(16));

    const chunkCode = readWord(romBuffer,trueObjectParamsLocation);
    console.log("chunkCode",chunkCode.toString(16));

    return ret;
}