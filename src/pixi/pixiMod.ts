/**
 * The purpose of this file is to take LevelObjects, and place them upon the
 * Pixi stage, one way or another. It does not handle rendering textures, only
 * combining them
 */

import { Application, RenderTexture, Rectangle } from "pixi.js";
import { } from "@pixi/tilemap";

import { DrawInstruction } from "../rom-mod/tile-rendering/tile-construction-tile-keys";
import { BLANK_SQUARE_RENDER_CODE, TILE_QUADRANT_DIMS_PX, WHITE_SQUARE_RENDER_CODE } from "../GLOBALS";
import { LayerOrder, Level, LevelObject, ORDER_PRIORITY_SPRITE } from "../rom-mod/RomInterfaces";

import { OBJECT_RECORDS } from "../rom-mod/tile-rendering/objectRecords";

import ScreenPageData from "../rom-mod/tile-rendering/ScreenPageChunks";
import { getGraphicFromChunkCode } from "../rom-mod/tile-rendering/texture-generation";

/**
 * Places chunk render codes for a LevelObject onto the Screen Pages. Note that
 * this does not actually render anything, merely place the codes
 * @param lo LevelObject to place on screenPages
 * @param level Current Level
 * @param screenPages ScreenPageData array to put tiles on
 * @param romBuffer Uint8Array to check for finding values better
 */
export function placeLevelObject(
    lo: LevelObject,
    level: Level,
    screenPages: ScreenPageData[],
    romBuffer: Uint8Array
): void {
    const perf = performance.now();
    const instructions = getDrawInstructionsForObject(lo, level, romBuffer);
    const insLen = instructions.length; // cache for speed
    for (let i = 0; i < insLen; i++) {
        executeInstruction(instructions[i], lo, screenPages);
    }
    const perfRes = performance.now() - perf;
    if (perfRes > 0.5) console.log(`Object 0x${lo.objectId.toString(16)} took ${perfRes} ms`);
}

function executeInstruction(instruction: DrawInstruction, lo: LevelObject, screenPages: ScreenPageData[]): void {
    if (lo.zIndex === undefined) {
        console.error("No zIndex!");
        return;
    }
    // Overwrite the instruction
    instruction.layer = lo.zIndex;
    if (lo.objectType === "sprite") {
        instruction.layer += ORDER_PRIORITY_SPRITE;
    }
    const tileScaleX = lo.xPos + instruction.offsetX;
    const tileScaleY = lo.yPos + instruction.offsetY;
    const screenPageId = ScreenPageData.getScreenPageIdFromTileCoords(tileScaleX,tileScaleY);
    // Switched to loop for less searches and earlier finishes
    const screensLength = screenPages.length;
    for (let i = 0; i < screensLength; i++) {
        if (screenPages[i].screenPageId === screenPageId) {
            screenPages[i].tileInstruction(
                tileScaleX % 0x10,
                tileScaleY % 0x10,
                instruction
            );
            return;
        }
    }
    console.error("Screen page ID not found:", screenPageId);
}

export function getDrawInstructionsForObject(lo: LevelObject,level: Level, romBuffer: Uint8Array): DrawInstruction[] {
    if (!lo || !lo.objectId || !level) {
        console.error("Cannot do getDrawInstructionsForObject, bad input", lo, level);
        return [];
    }

    const objectRecord = OBJECT_RECORDS.filter( x => {
        return x.objectType === lo.objectType
            && (lo.objectStorage === "s4byte") === x.isExtended
            && lo.objectId === x.objectId;
    })
    if (objectRecord.length === 1) {
        return objectRecord[0].instructionFunction(lo,level,romBuffer);
    } else if (objectRecord.length === 0) {
        if (lo.objectType === "sprite") {
            const tk = "S" + lo.objectId.toString(16).padStart(3,"0");
            return [{
                offsetX: 0,
                offsetY: 0,
                renderCodes: `${tk},${BLANK_SQUARE_RENDER_CODE},UNDL,UNDL`,
                layer: LayerOrder.SPRITES,
                uniqueLevelObjectId: lo.uuid
            }];
        }
        const blanks: string[] = [
            WHITE_SQUARE_RENDER_CODE,
            WHITE_SQUARE_RENDER_CODE,
            WHITE_SQUARE_RENDER_CODE,
            WHITE_SQUARE_RENDER_CODE
        ];
        return [{
            offsetX: 0,
            offsetY: 0,
            renderCodes: blanks.join(","),
            layer: LayerOrder.STANDARD_OBJECTS,
            uniqueLevelObjectId: lo.uuid
        }];
    } else {
        console.error("Found multiple object records:", lo, objectRecord);
        return [];
    }
}

interface TempRenderOrderData {
    rt: RenderTexture;
    localPixelX: number;
    localPixelY: number;
    uuid: string;
    layer: LayerOrder;
    chunkCode: string;
}

/**
 * Goes through screenPageData and renders each found graphic
 * Does not wipe existing data
 * @param curLevel Level you are currently on
 * @param pixiApp Application running
 * @param availableTextures RenderTexture cache map
 * @param setAvailableTextures Function to set updated textures
 * @param screenPageData ScreenPageData Screen Page data
 */
 export function renderScreen(
    curLevel: Level,
    pixiApp: Application,
    availableTextures: Record<string,RenderTexture>,
    setAvailableTextures: Function,
    sp: ScreenPageData
): void {
    if (!pixiApp) {
        console.error("Cannot render when pixiApp is not started");
        return;
    }
    // Wipe it
    sp.tilemap.clear();
    // It makes multiple tilesets within it
    sp.tilemap.children.forEach(c => {
        c.destroy();
    });
    sp.tilemap.removeChildren();
    if (!sp.hasChunkData) {
        return;
    }
    const perf = performance.now();
    let toRender: TempRenderOrderData[] = [];
    for (let innerChunkY = 0; innerChunkY < ScreenPageData.SCREEN_PAGE_CHUNK_DIMS; innerChunkY++) {
        for (let innerChunkX = 0; innerChunkX < ScreenPageData.SCREEN_PAGE_CHUNK_DIMS; innerChunkX++) {
            const curChunkTileDataArray = sp.getTileChunkDataFromLocalCoords(innerChunkX,innerChunkY);
            if (curChunkTileDataArray !== null) {
                curChunkTileDataArray.forEach(chunkTileData => {
                    const chunkCode = chunkTileData.chunkCode;
                    let renderTexture: RenderTexture | undefined = undefined;
                    if (availableTextures[chunkCode]) {
                        // Already available in texture cache
                        renderTexture = availableTextures[chunkCode];
                    } else {
                        // Generate new ones
                        const graphic = getGraphicFromChunkCode(chunkCode,curLevel);
                        renderTexture = pixiApp.renderer.generateTexture(graphic, {
                            region: new Rectangle(0,0,TILE_QUADRANT_DIMS_PX,TILE_QUADRANT_DIMS_PX)
                        });
                        availableTextures[chunkCode] = renderTexture;
                        // Don't leave it lying around
                        graphic.destroy();
                    }

                    toRender.push({
                        rt: renderTexture,
                        localPixelX: innerChunkX * 8,
                        localPixelY: innerChunkY * 8,
                        uuid: chunkTileData.objUuidFrom,
                        layer: chunkTileData.layer,
                        chunkCode: chunkCode
                    });
                });
            }
        }
    }
    console.log(`Rendered ScreenPage ${sp.screenPageId} in ${performance.now() - perf} ms`);
    setAvailableTextures(availableTextures);
    // Sort by layer
    toRender.sort((x: TempRenderOrderData,y: TempRenderOrderData) => {
        if (x.layer > y.layer) {
            return 1;
        }
        if (x.layer < y.layer) {
            return -1;
        }
        return 0;
    });
    // Actually place renders (takes like 345 ms)
    toRender.forEach(x => {
        sp.tilemap.tile(x.rt,
            x.localPixelX,
            x.localPixelY
        );
    });
}