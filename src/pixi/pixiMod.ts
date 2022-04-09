/**
 * The purpose of this file is to take LevelObjects, and place them upon the
 * Pixi stage, one way or another. It does not handle rendering textures, only
 * combining them
 */

import { Application, RenderTexture, Sprite, Rectangle } from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";

import { DrawInstruction } from "../rom-mod/tile-rendering/tile-construction-tile-keys";
import { BLANK_SQUARE_RENDER_CODE, TILEMAP_ID, TILE_QUADRANT_DIMS_PX, WHITE_SQUARE_RENDER_CODE } from "../GLOBALS";
import { LayerOrder, Level, LevelObject } from "../rom-mod/RomInterfaces";

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
    const instructions = getDrawInstructionsForObject(lo, level, romBuffer);
    instructions.forEach(i => {
        executeInstruction(i, lo, screenPages);
    });
}

function executeInstruction(instruction: DrawInstruction, lo: LevelObject, screenPages: ScreenPageData[]): void {
    const tileScaleX = lo.xPos + instruction.offsetX;
    const tileScaleY = lo.yPos + instruction.offsetY;
    const screenPageId = ScreenPageData.getScreenPageIdFromTileCoords(tileScaleX,tileScaleY);
    screenPages.filter(sx => sx.screenPageId === screenPageId)[0].tileInstruction(
        tileScaleX % 0x10,
        tileScaleY % 0x10,
        instruction
    );
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
        // console.debug("Object render data not found:", lo);
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
    globalPixelX: number;
    globalPixelY: number;
    uuid: string;
    layer: LayerOrder;
}

/**
 * Goes through screenPageData and renders each found graphic
 * Does not wipe existing data
 * @param curLevel Level you are currently on
 * @param pixiApp Application running
 * @param availableTextures RenderTexture cache map
 * @param setAvailableTextures Function to set updated textures
 * @param screenPageData ScreenPageData[] Screen Page data
 */
export function fullRender(
    curLevel: Level,
    pixiApp: Application,
    availableTextures: Record<string,RenderTexture>,
    setAvailableTextures: Function,
    screenPageData: ScreenPageData[]
): void {
    if (!pixiApp) {
        console.error("Cannot render when pixiApp is not started");
        return;
    }
    let toRender: TempRenderOrderData[] = [];
    const tilemap = pixiApp.stage.getChildByName(TILEMAP_ID) as CompositeTilemap;
    screenPageData.forEach(sp => {
        if (sp.hasChunkData) {
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
                                setAvailableTextures({
                                    chunkCode: renderTexture,
                                    ...availableTextures
                                });
                                // Don't leave it lying around
                                graphic.destroy();
                            }
                            // Place render texture
                            const pxCoords = sp.getGlobalPixelCoordsFromChunkCoords(innerChunkX,innerChunkY);
                            toRender.push({
                                rt: renderTexture,
                                globalPixelX: pxCoords.globalPixelX,
                                globalPixelY: pxCoords.globalPixelY,
                                uuid: chunkTileData.objUuidFrom,
                                layer: chunkTileData.layer
                            });
                        });
                    }
                }
            }
        }
    });
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
    // Actually render
    toRender.forEach(x => {
        tilemap.tile(x.rt,
            x.globalPixelX,
            x.globalPixelY
        );
        const spr = Sprite.from(availableTextures[WHITE_SQUARE_RENDER_CODE]);
        spr.interactive = true;
        spr.buttonMode = true;
        spr.alpha = 0;
        spr.x = x.globalPixelX;
        spr.y = x.globalPixelY;
        spr.on("pointerdown", () => {
            (window as any).spriteClicked(x.uuid);
        });
        pixiApp.stage.addChild(spr);
    })
}

export function wipeTiles(pixiApp: Application) {
    const tilemap = pixiApp.stage.getChildByName(TILEMAP_ID) as CompositeTilemap;
    tilemap.clear();
    // It makes multiple tilesets within it
    tilemap.children.forEach(c => {
        c.destroy();
    });
    tilemap.removeChildren();
    // Also clear the interactive overlays while you're at it
    const toRemove = pixiApp.stage.children.filter(c => c.name !== TILEMAP_ID);
    toRemove.forEach(ch => {
        ch.destroy();
        pixiApp.stage.removeChild(ch);
    });
}