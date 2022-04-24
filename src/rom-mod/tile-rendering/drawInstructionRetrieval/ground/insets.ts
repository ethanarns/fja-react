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
            if (xOffset === 0) {
                if (yOffset === 0) {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["CORNER_TOP_LEFT"]);
                    const overlappingObjectForLeftWallTop = ScreenPageData.getLevelObjectOverlapping(lo,xOffset,yOffset,screenPages,level);
                    if (overlappingObjectForLeftWallTop) {
                        if(overlappingObjectForLeftWallTop.objectId === 0x2) {
                            renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["ENTRANCE_LEFT_TOP"]);
                        }
                    }
                } else if (yOffset === yLength) {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["CORNER_BOTTOM_LEFT"]);
                } else {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["WALL_LEFT"]);
                    const overlappingObjectForLeftWall = ScreenPageData.getLevelObjectOverlapping(lo,xOffset,yOffset,screenPages,level);
                    if (overlappingObjectForLeftWall) {
                        if(overlappingObjectForLeftWall.objectId === 0x2) {
                            renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["ENTRANCE_LEFT_MIDDLE"]);
                        }
                    }
                }
            } else if (xOffset === xLength) {
                if (yOffset === 0) {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["CORNER_TOP_RIGHT"]);
                } else if (yOffset === yLength) {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["CORNER_BOTTOM_RIGHT"]);
                } else {
                    renderCode = getTileRenderCodesFromTilecode(romBuffer,INSET_TILE_CODES["WALL_RIGHT"]);
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
            result.push({
                offsetX: xOffset,
                offsetY: yOffset,
                renderCodes: renderCode
            });
        }
    }
    return result;
}