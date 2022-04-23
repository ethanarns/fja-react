import { LevelObject } from "../../../RomInterfaces";
import { DrawInstruction } from "../../tile-construction-tile-keys";

// 0x1
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

// 0x2
export function drawGroundLeftCorner(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const zLength = lo.dimZ;
    if (zLength === undefined) {
        console.error("drawGroundEdge2 is missing z dimension:",lo);
        return [];
    }
    // Base
    result.push({
        offsetY: 0,
        offsetX: 0,
        renderCodes: "4054,4055,4063,4065",
        layer: lo.zIndex,
        uniqueLevelObjectId: lo.uuid
    });
    // Topfuzz
    result.push({
        offsetY: -1,
        offsetX: 0,
        renderCodes: "40ff,40ff,4046,4047",
        layer: lo.zIndex,
        uniqueLevelObjectId: lo.uuid
    });
    // Topfuzz corner
    result.push({
        offsetY: -1,
        offsetX: -1,
        renderCodes: "40ff,40ff,40ff,4042",
        layer: lo.zIndex,
        uniqueLevelObjectId: lo.uuid
    });
    // Left tuft
    result.push({
        offsetY: 0,
        offsetX: -1,
        renderCodes: "40ff,4052,40ff,4062",
        layer: lo.zIndex,
        uniqueLevelObjectId: lo.uuid
    });
    // First below base
    result.push({
        offsetY: 1,
        offsetX: 0,
        renderCodes: "4043,4076,405d,407f",
        layer: lo.zIndex,
        uniqueLevelObjectId: lo.uuid
    });
    for (let downOffset = 0; downOffset < zLength-1; downOffset++) {
        result.push({
            offsetY: 2+downOffset,
            offsetX: 0,
            renderCodes: "406d,406e,406d,407f",
            layer: lo.zIndex,
            uniqueLevelObjectId: lo.uuid
        });
    }
    return result;
}

// 0x3
export function drawGroundRightCorner(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const zLength = lo.dimZ;
    if (zLength === undefined) {
        console.error("drawGroundEdge3 is missing z dimension:",lo);
        return [];
    }
    // Base
    result.push({
        offsetY: 0,
        offsetX: 0,
        renderCodes: "4455,4454,4465,4463",
        layer: lo.zIndex,
        uniqueLevelObjectId: lo.uuid
    });
    result.push({
        offsetY: -1,
        offsetX: 0,
        renderCodes: "40ff,40ff,4044,4045",
        layer: lo.zIndex,
        uniqueLevelObjectId: lo.uuid
    });
    result.push({
        offsetY: 1,
        offsetX: 0,
        renderCodes: "4476,4443,407e,445d",
        layer: lo.zIndex,
        uniqueLevelObjectId: lo.uuid
    });
    for (let downOffset = 0; downOffset < zLength-1; downOffset++) {
        result.push({
            offsetY: 2+downOffset,
            offsetX: 0,
            renderCodes: "447f,447d,4073,447d",
            layer: lo.zIndex,
            uniqueLevelObjectId: lo.uuid
        });
    }
    result.push({
        offsetY: 0,
        offsetX: 1,
        renderCodes: "4452,40ff,4462,40ff",
        layer: lo.zIndex,
        uniqueLevelObjectId: lo.uuid
    });
    result.push({
        offsetY: -1,
        offsetX: 1,
        renderCodes: "40ff,40ff,4442,40ff",
        layer: lo.zIndex,
        uniqueLevelObjectId: lo.uuid
    });
    return result;
}