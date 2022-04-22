import { LEVEL_DATA_LIST_BASE_PTR, LEVEL_SPRITES_BASE_PTR } from "../../GLOBALS";
import { readAddressFromArray, writeArrayToIndex } from "../binaryUtils/binary-io";
import { Level } from "../RomInterfaces";
import { CompiledLevel } from "./compiler";

export function writeLevel(romBuffer: Uint8Array, level: Level, compiledLevelData: CompiledLevel): void {
    const levelAddr = readAddressFromArray(romBuffer,LEVEL_DATA_LIST_BASE_PTR,level.levelId);
    writeArrayToIndex(romBuffer,levelAddr,compiledLevelData.primaryLevelData);
    const levelAddrSprites = readAddressFromArray(romBuffer,LEVEL_SPRITES_BASE_PTR,level.levelId);
    writeArrayToIndex(romBuffer,levelAddrSprites,compiledLevelData.sprites);
}