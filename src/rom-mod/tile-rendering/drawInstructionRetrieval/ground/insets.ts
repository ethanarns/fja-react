import { Level, LevelObject } from "../../../RomInterfaces";
import ScreenPageData from "../../ScreenPageChunks";
import { DrawInstruction } from "../../tile-construction-tile-keys";
import { getTileRenderCodesFromTilecode } from "../commonInstructions";

// Found these by sniffing r2 at 0x08028af8
const INSET_TILE_CODES: Record<string,number> = {
    CEILING_INSIDE: 0x700a,
    FLOOR_INSIDE_FLAT: 0x700b,
    WALL_LEFT: 0x700c,
    WALL_RIGHT: 0x700d,
    CORNER_TOP_LEFT: 0x700e,
    CORNER_TOP_RIGHT: 0x700f,
    CORNER_BOTTOM_LEFT: 0x7010,
    CORNER_BOTTOM_RIGHT: 0x7011,
    FILL: 0x7012,

    ENTRANCE_LEFT_MIDDLE: 0x7016,
    ENTRANCE_RIGHT_MIDDLE: 0x7017,
    ENTRANCE_LEFT_TOP: 0x7018,
    ENTRANCE_RIGHT_TOP: 0x7019,
}
const LEFT_GROUND_ID = 0x2;
const RIGHT_GROUND_ID = 0x3;
const FILL_CHUNK_CODES = ["4192","415e","4103"];

export function getRectangularGroundInset(lo: LevelObject, level: Level, romBuffer: Uint8Array, screenPages: ScreenPageData[]): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    let yLength = lo.dimY;
    let xLength = lo.dimX;
    if (yLength === undefined || xLength === undefined) {
        console.error("drawGround6 missing XY dims:",lo);
        return [];
    }
    for (let yOffset = 0; yOffset < yLength+1; yOffset++) {
        for (let xOffset = 0; xOffset < xLength+1; xOffset++) {
            let renderCode = "BLNK";
            const overlapData = ScreenPageData.getLevelObjectOverlapping(lo,xOffset,yOffset,screenPages,level);
            if (xOffset === 0) {
                if (yOffset === 0) {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["CORNER_TOP_LEFT"]);                    
                    if (overlapData.levelObject) {
                        if(overlapData.levelObject.objectId === LEFT_GROUND_ID) {
                            renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["ENTRANCE_LEFT_TOP"]);
                        }
                    }
                } else if (yOffset === yLength) {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["CORNER_BOTTOM_LEFT"]);
                } else {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["WALL_LEFT"]);
                    if (overlapData.levelObject) {
                        if(overlapData.levelObject.objectId === LEFT_GROUND_ID) {
                            renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["ENTRANCE_LEFT_MIDDLE"]);
                        }
                    }
                }
            } else if (xOffset === xLength) {
                if (yOffset === 0) {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["CORNER_TOP_RIGHT"]);
                    if (overlapData.levelObject) {
                        if(overlapData.levelObject.objectId === RIGHT_GROUND_ID) {
                            renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["ENTRANCE_RIGHT_TOP"]);
                        }
                    }
                } else if (yOffset === yLength) {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["CORNER_BOTTOM_RIGHT"]);
                } else {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["WALL_RIGHT"]);
                    if (overlapData.levelObject) {
                        if(overlapData.levelObject.objectId === RIGHT_GROUND_ID) {
                            renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["ENTRANCE_RIGHT_MIDDLE"]);
                        }
                    }
                }
            } else {
                if (yOffset === 0) {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["CEILING_INSIDE"]);
                } else if (yOffset === yLength) {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["FLOOR_INSIDE_FLAT"]);
                } else {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["FILL"]);
                }
            }
            // Now cancel any render codes going on top of existing fills
            if (overlapData.chunks) {
                if (overlapData.chunks.length !== 4) {
                    console.error("FATAL ERROR: Chunks should be length 4!", overlapData);
                } else {
                    const ogRenderCodes = renderCode.split(",");
                    let newRenderCodeArray: string[] = [];
                    overlapData.chunks.forEach((ch,index) => {
                        if (FILL_CHUNK_CODES.includes(ch.chunkCode)) {
                            newRenderCodeArray.push(FILL_CHUNK_CODES[0]);
                        } else {
                            newRenderCodeArray.push(ogRenderCodes[index]);
                        }
                    });
                    renderCode = newRenderCodeArray.join(",");
                }
            }
            result.push({
                offsetX: xOffset,
                offsetY: yOffset,
                renderCodes: renderCode
            });
        }
    }
    return result;
}