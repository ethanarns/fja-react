import { LevelObject } from "../../RomInterfaces";
import { DrawInstruction } from "../tile-construction-tile-keys";

export const COIN_CHUNK_CODES = "YCTL,YCTR,YCBL,YCBR";
export const RED_COIN_CHUNK_CODES = "RCTL,RCTR,RCBL,RCBR";

export function yellowCoinRepeatingRightOneSpace(lo: LevelObject): DrawInstruction[] {
    let ret: DrawInstruction[] = [];
    if (lo.dimZ === undefined) {
        return [];
    }
    for (let dimZindex = 0; dimZindex < lo.dimZ+1; dimZindex += 2) {
        ret.push({
            offsetX: dimZindex,
            offsetY: 0,
            renderCodes: COIN_CHUNK_CODES,
            uniqueLevelObjectId: lo.uuid,
            layer: lo.zIndex
        });
    }
    return ret;
}