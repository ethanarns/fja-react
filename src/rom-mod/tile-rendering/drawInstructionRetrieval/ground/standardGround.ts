import { LevelObject } from "../../../RomInterfaces";
import { DrawInstruction } from "../../tile-construction-tile-keys";

export function drawGround(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const yLength = lo.dimY;
    const xLength = lo.dimX;
    if (yLength === undefined || xLength === undefined) {
        console.error("drawGround missing XY dims:",lo);
        return [];
    }
    // Draw base layer
    for (let baseIndex = 0; baseIndex < xLength+1; baseIndex++) {
        result.push({
            offsetY: 0,
            offsetX: baseIndex,
            renderCodes: "4054,4055,4064,4065",
            layer: lo.zIndex,
            uniqueLevelObjectId: lo.uuid
        });
    }
    // Draw Fuzz layer
    for (let baseIndex = 0; baseIndex < xLength+1; baseIndex++) {
        result.push({
            offsetY: -1,
            offsetX: baseIndex,
            renderCodes: "40ff,40ff,4044,4045",
            layer: lo.zIndex,
            uniqueLevelObjectId: lo.uuid
        });
    }
    // Draw underground
    for (let y = 1; y < yLength+1; y++) {
        for (let x = 0; x < xLength+1; x++) {
            result.push({
                offsetY: y,
                offsetX: x,
                renderCodes: "406f,407e,407f,406e",
                layer: lo.zIndex,
                uniqueLevelObjectId: lo.uuid
            });
        }
    }
    return result;
}