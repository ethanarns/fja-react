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
        renderCodes: "4455,4454,4465,4463"
    });
    result.push({
        offsetY: -1,
        offsetX: 0,
        renderCodes: "40ff,40ff,4044,4045"
    });
    result.push({
        offsetY: 1,
        offsetX: 0,
        renderCodes: "4476,4443,407e,445d"
    });
    for (let downOffset = 0; downOffset < zLength-1; downOffset++) {
        result.push({
            offsetY: 2+downOffset,
            offsetX: 0,
            renderCodes: "447f,447d,4073,447d"
        });
    }
    result.push({
        offsetY: 0,
        offsetX: 1,
        renderCodes: "4452,40ff,4462,40ff"
    });
    result.push({
        offsetY: -1,
        offsetX: 1,
        renderCodes: "40ff,40ff,4442,40ff"
    });
    return result;
}

export function drawGround4(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const yLength = lo.dimY;
    const xLength = lo.dimX;
    if (yLength === undefined || xLength === undefined) {
        console.error("drawGround missing XY dims:",lo);
        return [];
    }
    const bottommostOffset = yLength+1;
    for (let baseIndex = 0; baseIndex < xLength+1; baseIndex++) {
        const betweenCalc = Math.floor(baseIndex/2);
        let downwardsIndex = betweenCalc+1;
        if (baseIndex % 2 === 0) {
            result.push({
                offsetY: betweenCalc,
                offsetX: baseIndex,
                renderCodes: "441d,441c,442d,442c"
            });
            result.push({
                offsetY: betweenCalc - 1,
                offsetX: baseIndex,
                renderCodes: "44ff,44ff,440d,440c"
            });
        } else {
            const secondBase = betweenCalc
            downwardsIndex = secondBase + 1;
            result.push({
                offsetY: secondBase,
                offsetX: baseIndex,
                renderCodes: "441b,441a,442b,442a"
            });
        }
        while (downwardsIndex < bottommostOffset) {
            result.push({
                offsetY: downwardsIndex,
                offsetX: baseIndex,
                renderCodes: "406f,407e,407f,406e"
            });
            downwardsIndex++;
        }
    }
    return result;
}

export function drawGround5(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const yLength = lo.dimY;
    const xLength = lo.dimX;
    if (yLength === undefined || xLength === undefined) {
        console.error("drawGardenGround missing XY dims:",lo);
        return [];
    }
    for (let baseIndex = 0; baseIndex < xLength+1; baseIndex++) {
        const betweenCalc = Math.floor(baseIndex/2)*-1;
        let downwardsIndex = betweenCalc;
        if (baseIndex % 2 === 0) {
            result.push({
                offsetY: betweenCalc,
                offsetX: baseIndex,
                renderCodes: "403a,403b,404a,404b"
            });
            // Base top fuzz
            result.push({
                offsetY: betweenCalc-1,
                offsetX: baseIndex,
                renderCodes: "401a,401b,402a,402b"
            });
        } else {
            downwardsIndex--;
            result.push({
                offsetY: betweenCalc-1,
                offsetX: baseIndex,
                renderCodes: "401c,401d,402c,402d"
            });
            result.push({
                offsetY: betweenCalc-2,
                offsetX: baseIndex,
                renderCodes: "44ff,44ff,400c,400d"
            });
        }
        while(downwardsIndex < yLength) {
            downwardsIndex++;
            result.push({
                offsetY: downwardsIndex,
                offsetX: baseIndex,
                renderCodes: "406f,407e,407f,406e"
            });
        }
    }
    return result;
}

export function drawGroundSlope45(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const yLength = lo.dimY;
    const xLength = lo.dimX;
    if (yLength === undefined || xLength === undefined) {
        console.error("drawGround missing XY dims:",lo);
        return [];
    }
    if (lo.objectId === 0x7) { // 45 Degrees slope up
        // Slopes, which aren't filling
        for (let baseIndex = 0; baseIndex < xLength+1; baseIndex++) {
            result.push({
                offsetY: baseIndex*-1,
                offsetX: baseIndex,
                renderCodes: "4054,4055,4064,4065"
            });
            result.push({
                offsetY: (baseIndex*-1)-2, // Negative is higher
                offsetX: baseIndex,
                renderCodes: "44ff,44ff,44ff,4009"
            });
            result.push({
                offsetY: (baseIndex*-1)-1, // Negative is higher
                offsetX: baseIndex,
                renderCodes: "4018,4019,4028,4029"
            });
        }
        // The non-rectangular fill directly below the steps
        for (let underSlopeY = 0; underSlopeY < xLength+1; underSlopeY++) {
            for (let underSlopeX = xLength; underSlopeX > underSlopeY; underSlopeX--) {
                result.push({
                    offsetY: underSlopeY*-1, // Negative is higher
                    offsetX: underSlopeX,
                    renderCodes: "406f,407e,407f,406e"
                });
            }
        }
        // The rectangular fill below the step triangle
        for (let rectUnderSlopeY = 1; rectUnderSlopeY < yLength+1; rectUnderSlopeY++) {
            for (let rectUnderSlopeX = 0; rectUnderSlopeX < xLength+1; rectUnderSlopeX++) {
                result.push({
                    offsetY: rectUnderSlopeY, // Negative is higher
                    offsetX: rectUnderSlopeX,
                    renderCodes: "406f,407e,407f,406e"
                });
            }
        }
    }
    return result;
}

export function drawGround6(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    const yLength = lo.dimY;
    const xLength = lo.dimX;
    if (yLength === undefined || xLength === undefined) {
        console.error("drawGround6 missing XY dims:",lo);
        return [];
    }
    for (let i = 0; i < xLength+1; i++) {
        result.push({
            offsetX: i,
            offsetY: i,
            renderCodes: "4419,4418,4429,4428"
        });
        result.push({
            offsetX: i,
            offsetY: i-1,
            renderCodes: "44ff,44ff,4409,44ff"
        });
        for (let downIndex = 1+i; downIndex < yLength+1; downIndex++) {
            result.push({
                offsetX: i,
                offsetY: downIndex,
                renderCodes: "406f,407e,407f,406e"
            });
        }
    }
    return result;
};

export function drawGroundSlantedDownCeiling(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    let yLength = lo.dimY;
    let xLength = lo.dimX;
    if (yLength === undefined || xLength === undefined) {
        console.error("drawGround6 missing XY dims:",lo);
        return [];
    }
    yLength++;
    xLength++;
    // First make the main ground rectangle
    // Since it goes up by 1 every 2 squares
    const rectHeight = yLength - Math.ceil(xLength/2);
    for (let rectY = 0; rectY < rectHeight; rectY++) {
        for (let rectX = 0; rectX < xLength; rectX++) {
            result.push({
                offsetY: rectY,
                offsetX: rectX,
                renderCodes: "406f,407e,407f,406e"
            });
        }
    }
    // Draw actual slope parts
    for (let slopeXOffset = 0; slopeXOffset < xLength; slopeXOffset++) {
        const slopeYoffset = rectHeight + Math.floor(slopeXOffset/2);
        const isShorter = slopeXOffset % 2 === 0;
        result.push({
            offsetY: slopeYoffset,
            offsetX: slopeXOffset,
            renderCodes: isShorter ? "41ae,41af,40ee,40ee" : "41be,406e,41ce,41cf"
        });
        // Fill from 1 below slope to right above fill
        for (let i = slopeYoffset-1; i >= rectHeight; i--) {
            result.push({
                offsetY: i,
                offsetX: slopeXOffset,
                renderCodes: "406f,407e,407f,406e"
            });
        }
    }
    return result;
}

export function drawGroundSlantedCeiling5f(lo: LevelObject): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    let yLength = lo.dimY;
    let xLength = lo.dimX;
    if (yLength === undefined || xLength === undefined) {
        console.error("drawGround6 missing XY dims:",lo);
        return [];
    }
    yLength++;
    xLength++;
    // First make the main ground rectangle
    // Since it goes up by 1 every 2 squares
    const rectHeight = yLength - Math.ceil(xLength/2);
    for (let rectY = 0; rectY < rectHeight; rectY++) {
        for (let rectX = 0; rectX < xLength; rectX++) {
            result.push({
                offsetY: rectY,
                offsetX: rectX,
                renderCodes: "406f,407e,407f,406e"
            });
        }
    }
    // Draw actual slope parts
    for (let slopeXOffset = 0; slopeXOffset < xLength; slopeXOffset++) {
        const slopeYoffset = (yLength + Math.floor(slopeXOffset/2)*-1)-1;
        const isShorter = slopeXOffset % 2 === 0;
        result.push({
            offsetY: slopeYoffset,
            offsetX: slopeXOffset,
            renderCodes: isShorter ? "407e,45be,45cf,45ce" : "45af,45ae,40ee,40ee"
        });
        // Fill from 1 below slope to right above fill
        for (let i = slopeYoffset-1; i >= rectHeight; i--) {
            result.push({
                offsetY: i,
                offsetX: slopeXOffset,
                renderCodes: "406f,407e,407f,406e"
            });
        }
    }
    return result;
}