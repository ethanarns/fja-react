import { } from "../../../binaryUtils/binary-io";
import { LayerOrder, LevelObject } from "../../../RomInterfaces";
import { DrawInstruction } from "../../tile-construction-tile-keys";

export function drawGardenGround(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const yLength = lo.dimY;
    const xLength = lo.dimX;
    if (yLength === undefined || xLength === undefined) {
        console.error("drawGardenGround missing XY dims:",lo);
        return [];
    }
    // Draw base layer
    for (let baseIndex = 0; baseIndex < xLength+1; baseIndex++) {
        result.push({
            offsetY: 0,
            offsetX: baseIndex,
            renderCodes: "4166,4167,4176,4177",
            uniqueLevelObjectId: lo.uuid,
            layer: LayerOrder.GROUND
        });
    }
    // Draw Fuzz layer
    for (let baseIndex = 0; baseIndex < xLength+1; baseIndex++) {
        result.push({
            offsetY: -1,
            offsetX: baseIndex,
            renderCodes: baseIndex % 2 ? "4148,4149,4158,4159" : "4146,4147,4156,4157",
            layer: LayerOrder.GROUND,
            uniqueLevelObjectId: lo.uuid
        });
    }
    // Draw underground
    for (let y = 1; y < yLength+1; y++) {
        for (let x = 0; x < xLength+1; x++) {
            result.push({
                offsetY: y,
                offsetX: x,
                renderCodes: "4500,4500,4500,4500",
                layer: LayerOrder.GROUND,
                uniqueLevelObjectId: lo.uuid
            });
        }
    }
    return result;
}