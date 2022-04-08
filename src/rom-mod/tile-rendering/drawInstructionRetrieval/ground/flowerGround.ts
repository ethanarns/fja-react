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

// 0xe5
export function drawGardenSlope_downleft_30(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const yLength = lo.dimY;
    if (yLength === undefined || lo.dimX === undefined) {
        console.error("drawGardenGround missing XY dims:",lo);
        return [];
    }
    // Usually 0, which translates to x width of 1
    const xLength = 0xff-lo.dimX;
    let yOffset = 0;
    for (let offsetX = 0; offsetX >= -1 * xLength; offsetX -= 2) {
        result.push({
            offsetX: offsetX,
            offsetY: yOffset,
            renderCodes: "4112,4113,4122,4123",
            layer: LayerOrder.GROUND,
            uniqueLevelObjectId: lo.uuid
        });
        result.push({
            offsetX: offsetX,
            offsetY: yOffset-1,
            renderCodes: "40ee,40ee,4102,4103",
            layer: LayerOrder.GROUND,
            uniqueLevelObjectId: lo.uuid
        });
        result.push({
            offsetX: offsetX-1,
            offsetY: yOffset,
            renderCodes: "4110,4111,4120,4121",
            layer: LayerOrder.GROUND,
            uniqueLevelObjectId: lo.uuid
        });
        for (let fillHeightIndex = yOffset+1; fillHeightIndex < yLength+1; fillHeightIndex++) {
            result.push({
                offsetX: offsetX,
                offsetY: fillHeightIndex,
                renderCodes: "4500,4500,4500,4500",
                layer: LayerOrder.GROUND,
                uniqueLevelObjectId: lo.uuid
            });
            result.push({
                offsetX: offsetX-1,
                offsetY: fillHeightIndex,
                renderCodes: "4500,4500,4500,4500",
                layer: LayerOrder.GROUND,
                uniqueLevelObjectId: lo.uuid
            });
        }
        yOffset++;
    }
    return result;
}

// 0xe6
export function drawGardenSlope_downLeft_45(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const yLength = lo.dimY;
    if (yLength === undefined || lo.dimX === undefined) {
        console.error("drawGardenGround missing XY dims:",lo);
        return [];
    }
    const xLength = lo.dimX === 0 ? 1 : 0xff-lo.dimX+1+1;
    for (let xOffset = 0; xOffset < xLength; xOffset++) {
        result.push({
            offsetX: xOffset*-1,
            offsetY: xOffset,
            renderCodes: "4114,4115,4124,4125",
            layer: LayerOrder.GROUND,
            uniqueLevelObjectId: lo.uuid
        });
        result.push({
            offsetX: xOffset*-1,
            offsetY: xOffset-1, // -1 means 1 above
            renderCodes: "40ee,40ee,4104,4105",
            layer: LayerOrder.GROUND,
            uniqueLevelObjectId: lo.uuid
        });
        result.push({
            offsetX: xOffset*-1,
            offsetY: xOffset+1, // +1 means 1 below
            renderCodes: "4134,4135,4144,4145",
            layer: LayerOrder.GROUND,
            uniqueLevelObjectId: lo.uuid
        });
        for (let yIndex = xOffset+2; yIndex < yLength+1; yIndex++) {
            result.push({
                offsetX: xOffset*-1,
                offsetY: yIndex,
                renderCodes: "4500,4500,4500,4500",
                layer: LayerOrder.GROUND,
                uniqueLevelObjectId: lo.uuid
            });
        }
    }
    return result;
}

// 0xea and 0xe7
export function drawFlowerSlope_steepest(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const yLength = lo.dimY;
    let xLength = lo.dimX;
    if (yLength === undefined || xLength === undefined) {
        console.error("drawGardenGround missing XY dims:",lo);
        return [];
    }
    if (lo.objectId === 0xea) {
        for (let xIndex = 0; xIndex < xLength+1; xIndex++) {
            const yOffset = xIndex*2;
            result.push({
                offsetX: xIndex,
                offsetY: yOffset,
                renderCodes: "4142,4143,4152,4153",
                layer: LayerOrder.GROUND,
                uniqueLevelObjectId: lo.uuid
            });
            result.push({
                offsetX: xIndex,
                offsetY: yOffset+1,
                renderCodes: "4162,4163,4172,4173",
                layer: LayerOrder.GROUND,
                uniqueLevelObjectId: lo.uuid
            });
            for (let downIndex = 2; downIndex < yLength+1-yOffset; downIndex++) {
                result.push({
                    offsetX: xIndex,
                    offsetY: yOffset+downIndex,
                    renderCodes: "4500,4500,4500,4500",
                    layer: LayerOrder.GROUND,
                    uniqueLevelObjectId: lo.uuid
                });
            }
        }
    } else if (lo.objectId === 0xe7) {
        xLength = 0xff - xLength + 1;
        for (let xIndex = 0; xIndex < xLength+1; xIndex++) {
            const yOffset = xIndex*2;
            result.push({
                offsetX: xIndex*-1,
                offsetY: yOffset,
                renderCodes: "4543,4542,4553,4552",
                layer: LayerOrder.GROUND,
                uniqueLevelObjectId: lo.uuid
            });
            result.push({
                offsetX: xIndex*-1,
                offsetY: yOffset+1,
                renderCodes: "4563,4562,4573,4572",
                layer: LayerOrder.GROUND,
                uniqueLevelObjectId: lo.uuid
            });
            for (let downIndex = 2; downIndex < yLength+1-yOffset; downIndex++) {
                result.push({
                    offsetX: xIndex*-1,
                    offsetY: yOffset+downIndex,
                    renderCodes: "4500,4500,4500,4500",
                    layer: LayerOrder.GROUND,
                    uniqueLevelObjectId: lo.uuid
                });
            }
        }
    }
    return result;
}