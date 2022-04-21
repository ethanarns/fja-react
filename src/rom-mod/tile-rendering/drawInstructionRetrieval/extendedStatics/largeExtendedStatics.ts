import { Level, LevelObject } from "../../../RomInterfaces";
import { DrawInstruction } from "../../tile-construction-tile-keys";
import { readAddressFromArray, readByteFromArray, readWordFromArray } from "../../../binaryUtils/binary-io";
import { getTileRenderCodesFromTilecode } from "./../commonInstructions";

export function bigBlueRocks(lo: LevelObject, level: Level, romBuffer: Uint8Array): DrawInstruction[] {
    let ret: DrawInstruction[] = [];

    // 0x081be854
    const BLUEROCKS_STATICS_ARRAY = 0x001be854;
    const BLUEROCKS_HEIGHTS_ARRAY = 0x001c1978;
    const BLUEROCKS_WIDTHS_ARRAY = 0x001c196c;

    const offsetId = lo.objectId - 0xd4;
    const brStaticsAddr = readAddressFromArray(romBuffer, BLUEROCKS_STATICS_ARRAY, offsetId);
    const height = readByteFromArray(romBuffer,BLUEROCKS_HEIGHTS_ARRAY,offsetId);
    const width = readByteFromArray(romBuffer,BLUEROCKS_WIDTHS_ARRAY,offsetId);

    for (let heightIndex = 0; heightIndex < height; heightIndex++) {
        for (let widthIndex = 0; widthIndex < width; widthIndex++) {
            const tileValue = readWordFromArray(romBuffer,brStaticsAddr,(heightIndex*width+widthIndex));
            ret.push({
                offsetX: widthIndex,
                offsetY: heightIndex,
                uniqueLevelObjectId: lo.uuid,
                layer: lo.zIndex,
                renderCodes: getTileRenderCodesFromTilecode(romBuffer,tileValue)
            });
        }
    }
    return ret;
}


export function drawing_related_posmaybe(absolutePosition: number, curobj_relY: number, romBuffer: Uint8Array): number {
    /* eslint-disable no-mixed-operators */
    let uVar1 = (absolutePosition & 0xf0f) << 0x10 |
        (((absolutePosition & 0xffff | 0xf00) + 0x10 & 0xffff | 0xf00) +
            (((curobj_relY & 0xf) << 0x14 | (curobj_relY & 0xf0) << 0x18) >> 0x10)) *
        0x10000 & 0x70f00000;

    return (
        readByteFromArray(romBuffer, 0x0201b800, uVar1 >> 0x18) & 0x3f
    ) << 9 | (uVar1 & 0xff0000) >> 0xf;
}