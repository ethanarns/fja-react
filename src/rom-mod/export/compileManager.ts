import { LEVEL_DATA_LIST_BASE_PTR, ROM_ADDRESS_OFFSET } from "../../GLOBALS";
import { readAddressFromArray, writeArrayToIndex } from "../binaryUtils/binary-io";
import { Level } from "../RomInterfaces";
import { CompiledLevel } from "./compiler";

export function writeLevel(romBuffer: Uint8Array, level: Level, compiledLevelData: CompiledLevel): void {
    const levelAddr = readAddressFromArray(romBuffer,LEVEL_DATA_LIST_BASE_PTR,level.levelId);
    console.log("Writing primaryLevelData to addr",(levelAddr + ROM_ADDRESS_OFFSET).toString(16));
    writeArrayToIndex(romBuffer,levelAddr,compiledLevelData.primaryLevelData);
}