/**
 * The purpose of this file is to take LevelObjects, and place them upon the
 * Pixi stage, one way or another. It does not handle rendering textures, only
 * combining them
 */

import { Application, RenderTexture, Rectangle, filters, Sprite } from "pixi.js";

import { DrawInstruction } from "../rom-mod/tile-rendering/tile-construction-tile-keys";
import { BLANK_SQUARE_RENDER_CODE, TILE_QUADRANT_DIMS_PX, WHITE_SQUARE_RENDER_CODE } from "../GLOBALS";
import { Level, LevelObject, ORDER_PRIORITY_SPRITE } from "../rom-mod/RomInterfaces";

import { OBJECT_RECORDS } from "../rom-mod/tile-rendering/objectRecords";

import ScreenPageData, { ChunkEffect } from "../rom-mod/tile-rendering/ScreenPageChunks";
import { BUILTIN_CHUNK_CODES, getGraphicFromChunkCode, INVERT_CACHE } from "../rom-mod/tile-rendering/texture-generation";

const colorMatrixFilter = new filters.ColorMatrixFilter();

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
    //const perf = performance.now();
    const instructions = getDrawInstructionsForObject(lo, level, romBuffer, screenPages);
    const insLen = instructions.length; // cache for speed
    for (let i = 0; i < insLen; i++) {
        executeInstruction(instructions[i], lo, screenPages);
    }
    //const perfRes = performance.now() - perf;
    //if (perfRes > 0.5) console.log(`Object 0x${lo.objectId.toString(16)} took ${perfRes} ms`);
}

function executeInstruction(instruction: DrawInstruction, lo: LevelObject, screenPages: ScreenPageData[]): void {
    if (lo.zIndex === undefined) {
        console.error("No zIndex!");
        return;
    }
    if (instruction.layer === undefined) {
        instruction.layer = lo.zIndex;
    }
    if (!instruction.uniqueLevelObjectId) {
        instruction.uniqueLevelObjectId = lo.uuid;
    }
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

export function getDrawInstructionsForObject(lo: LevelObject,level: Level, romBuffer: Uint8Array, screenPages: ScreenPageData[]): DrawInstruction[] {
    if (!lo || !lo.objectId || !level) {
        console.error("Cannot do getDrawInstructionsForObject, bad input", lo, level);
        return [];
    }

    const objectRecord = OBJECT_RECORDS.filter( x => {
        return x.objectType === lo.objectType
            && (lo.objectStorage === "s4byte") === x.isExtended
            && lo.objectId === x.objectId;
    })
    if (objectRecord.length <= 1) {
        if (objectRecord.length === 1 && objectRecord[0].instructionFunction) {
            // This is the replacable function that
            return objectRecord[0].instructionFunction(lo,level,romBuffer, screenPages);
        }
        if (lo.objectType === "sprite") {
            const tk = "S" + lo.objectId.toString(16).padStart(3,"0");
            return [{
                offsetX: 0,
                offsetY: 0,
                renderCodes: `${tk},${BLANK_SQUARE_RENDER_CODE},UNDL,UNDL`,
                layer: lo.zIndex,
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
            layer: lo.zIndex,
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
    layer: number;
    chunkCode: string;
    effect: ChunkEffect;
}

/**
 * Goes through screenPageData and renders each found graphic
 * Does not wipe existing data
 * @param curLevel Level you are currently on
 * @param pixiApp Application running
 * @param availableTextures RenderTexture cache map
 * @param sp ScreenPageData Screen Page data
 */
 export function renderScreen(
    curLevel: Level,
    pixiApp: Application,
    availableTextures: Record<string,RenderTexture>,
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
    //const perf = performance.now();
    let toRender: TempRenderOrderData[] = [];
    for (let innerChunkY = 0; innerChunkY < ScreenPageData.SCREEN_PAGE_CHUNK_DIMS; innerChunkY++) {
        for (let innerChunkX = 0; innerChunkX < ScreenPageData.SCREEN_PAGE_CHUNK_DIMS; innerChunkX++) {
            const curChunk = sp.getTileChunkDataFromLocalCoords(innerChunkX,innerChunkY);
            if (curChunk !== null) {
                // curChunkTileDataArray.forEach(chunkTileData => {
                    const chunkCode = curChunk.chunkCode;
                    let renderTexture: RenderTexture | undefined = undefined;
                    // No effects, render normally //
                    if (curChunk.effect === "normal") {
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
                    // Inverted effect (usually selection), do special //
                    } else if (curChunk.effect === "inverted") {
                        if (INVERT_CACHE[chunkCode]) {
                            renderTexture = INVERT_CACHE[chunkCode];
                        } else if (BUILTIN_CHUNK_CODES.includes(chunkCode)) {
                            // Built in, generate on the fly
                            const tempSprite = new Sprite(availableTextures[chunkCode]);
                            tempSprite.filters = [colorMatrixFilter];
                            colorMatrixFilter.negative(false);
                            renderTexture = pixiApp.renderer.generateTexture(tempSprite, {
                                region: new Rectangle(0,0,TILE_QUADRANT_DIMS_PX,TILE_QUADRANT_DIMS_PX)
                            });
                            tempSprite.destroy();
                            INVERT_CACHE[chunkCode] = renderTexture;
                        } else if (chunkCode.toUpperCase().startsWith("S")){
                            // Sprite (all prebuilt)
                            renderTexture = availableTextures[chunkCode];
                        } else {
                            const graphicI = getGraphicFromChunkCode(chunkCode,curLevel, {
                                invert: true
                            });
                            renderTexture = pixiApp.renderer.generateTexture(graphicI, {
                                region: new Rectangle(0,0,TILE_QUADRANT_DIMS_PX,TILE_QUADRANT_DIMS_PX)
                            });
                            graphicI.destroy();
                            INVERT_CACHE[chunkCode] = renderTexture;
                        }
                    }

                    // If its successful, pass it off to be rendered
                    if (renderTexture !== undefined) {
                        toRender.push({
                            rt: renderTexture,
                            localPixelX: innerChunkX * 8,
                            localPixelY: innerChunkY * 8,
                            uuid: curChunk.objUuidFrom,
                            layer: curChunk.layer,
                            chunkCode: chunkCode,
                            effect: curChunk.effect
                        });
                    }
                // });
            }
        }
    }
    //console.log(`Rendered ScreenPage ${sp.screenPageId} in ${performance.now() - perf} ms`);
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
    // Render
    toRender.forEach(x => {
        sp.tilemap.tile(x.rt,
            x.localPixelX,
            x.localPixelY
        );
    });
}

/**
 * Deletes level object by uuid. Does not replace tiles or rerender, only
 * modifies the Level
 * 
 * @param objectUuid UUID of object to delete
 * @param level Level
 */
export function deleteObject(objectUuid: string, level: Level): void {
    if (!objectUuid) {
        console.error("Cannot delete, no uuid", objectUuid);
        return;
    }
    if (!level || !level.objects) {
        console.error("No levelObjects to delete", level);
        return;
    }
    const delIndex = level.objects.map(x => x.uuid).indexOf(objectUuid);
    if (delIndex === -1) {
        console.warn("No object with uuid found:", objectUuid);
    } else {
        level.objects.splice(delIndex,1);
    }
}