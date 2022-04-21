import { Level, LevelObject } from "../../../RomInterfaces";
import { DrawInstruction } from "../../tile-construction-tile-keys";
import { } from "../../../binaryUtils/binary-io";
import { getFixedDimsObject } from "./../commonInstructions";

export function redSign(lo: LevelObject, level: Level, romBuffer: Uint8Array): DrawInstruction[] {
    // Top two are always normal, but the last 2 change depending on the level
    let tiles: number[] = [ 0x0025, 0x0026, 0x0013, 0x0014 ];

    // TODO: Find out more about this. Leave as normal for now, it works
    //   due to layer ordering anyway
    // CONFIRMED: 0x008e,8f are flower garden, 0x0013,14 are no bottom

    // 0xc = flower garden, 0x4 = snow
    // const tileset = level.headers.tileset;
    // const isOverlaping = level.objects.filter(x => x.xPos === lo.xPos && x.yPos === lo.yPos).length > 1;
    // if (tileset === 0xc) {
    //     if (isOverlaping) {
    //         // Flower overlap
    //         tiles[2] = 0x008e;
    //         tiles[3] = 0x008f;
    //     } else {
    //         // No bottom
    //         tiles[2] = 0x0013;
    //         tiles[3] = 0x0014;
    //     }
    // } else if (tileset === 0x4) {
    //     tiles[0]
    // } else {
    //     // NOT snow tiles (0x4)
    //     tiles[2] = 0x000c;
    //     tiles[3] = 0x000d;
    // }
    return getFixedDimsObject(lo,tiles,2,2,romBuffer);
}