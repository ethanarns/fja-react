import { readWordFromArray } from "../../../binaryUtils/binary-io";
import { Level, LevelObject } from "../../../RomInterfaces";
import { DrawInstruction } from "../../tile-construction-tile-keys";
import { getTileRenderCodesFromTilecode } from "./../commonInstructions";

export function generateStoneBlocks(lo: LevelObject, level: Level, romBuffer: Uint8Array, random: boolean): DrawInstruction[] {
    let ret: DrawInstruction[] = [];
    if (lo.dimX === undefined || lo.dimY === undefined) {
        console.error("Stone blocks missing dimensions:", lo);
        return [];
    }
    const tileCodeArray = 0x001c08ba;
    for (let yPos = 0; yPos < lo.dimX + 1; yPos++) {
        for (let xPos = 0; xPos < lo.dimY + 1; xPos++) {
            let tileOffset = 0;
            if (random) {
                tileOffset = Math.floor(Math.random() * 7);
            }
            const tileCode = readWordFromArray(romBuffer,tileCodeArray,tileOffset);
            ret.push({
                offsetX: yPos,
                offsetY: xPos,
                uniqueLevelObjectId: lo.uuid,
                layer: lo.zIndex,
                renderCodes: getTileRenderCodesFromTilecode(romBuffer, tileCode)
            });
        }
    }
    return ret;
}