/**
 * The purpose of this file is to take LevelObjects, and place them upon the
 * Pixi stage, one way or another. It does not handle rendering textures, only
 * combining them
 */

import { Application, RenderTexture, SimplePlane, Texture } from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";

import { DrawInstruction, RENDERED_TILE_DEFAULTS } from "../rom-mod/tile-rendering/tile-construction-tile-keys";
import { FULL_TILE_DIMS_PX, TILEMAP_ID, TILE_QUADRANT_DIMS_PX } from "../GLOBALS";
import { Level, LevelObject } from "../rom-mod/RomInterfaces";

import getStatic4ByteDrawInstuctions from "../rom-mod/tile-rendering/drawInstructionRetrieval/static4byte";
import getStatic5ByteDrawInstuctions from "../rom-mod/tile-rendering/drawInstructionRetrieval/static5byte";

export function placeLevelObject(lo: LevelObject, level: Level, pixiApp: Application, textureMap: Record<string,RenderTexture>): void {
    const instructions = getDrawInstructionsForObject(lo, level);
    instructions.forEach(instruction => {
        executeInstruction(instruction,pixiApp,lo.xPos,lo.yPos,textureMap,lo);
    });
}

export function getDrawInstructionsForObject(lo: LevelObject,level: Level): DrawInstruction[] {
    if (!lo || !lo.objectId || !level) {
        console.error("Cannot do getDrawInstructionsForObject, bad input", lo, level);
        return [];
    }

    if (lo.objectType === "static") {
        if (lo.objectStorage === "s4byte") {
            return getStatic4ByteDrawInstuctions(lo, level);
        } else {
            return getStatic5ByteDrawInstuctions(lo, level);
        }
    } else {
        return getSpriteInstructions(lo, level);
    }
}

function getSpriteInstructions(lo: LevelObject, level: Level): DrawInstruction[] {
    let ret: DrawInstruction[] = [];

    return ret;
}

function executeInstruction(
    instruction: DrawInstruction,
    pixiApp: Application,
    sourceX: number,
    sourceY: number,
    textureMap: Record<string,RenderTexture>,
    lo: LevelObject
) {
    const trueX = sourceX + instruction.offsetX;
    const trueY = sourceY + instruction.offsetY;
    console.log("executing instruction at",trueX,trueY);
    const globalX = trueX * FULL_TILE_DIMS_PX;
    const globalY = trueY * FULL_TILE_DIMS_PX;
    if (instruction.renderData.dataType === "quadChunkNamedString") {
        const quadChunkCodeString = RENDERED_TILE_DEFAULTS[instruction.renderData.data as string];
        placeChunkArray(globalX,globalY,quadChunkCodeString.split(","),textureMap,pixiApp,lo);
    } else if (instruction.renderData.dataType === "singleChunkCode") {

    } else if (instruction.renderData.dataType === "quadChunkString") {

    } else if (instruction.renderData.dataType === "quadChunkArray") {

    } else {
        console.error("Unknown instruction render type:", instruction.renderData);
    }
}

function placeChunkArray(
    globalRootX: number,
    globalRootY: number,
    chunkCodes: string[],
    textureMap: Record<string,RenderTexture>,
    pixiApp: Application,
    levelObject: LevelObject
): void {
    if (chunkCodes.length !== 4) {
        console.error("Bad chunk code array:", chunkCodes);
        return;
    }
    const tilemap = pixiApp.stage.getChildByName(TILEMAP_ID) as CompositeTilemap;
    tilemap.tile(textureMap[chunkCodes[0]],
        globalRootX,
        globalRootY
    );
    tilemap.tile(textureMap[chunkCodes[1]],
        globalRootX + TILE_QUADRANT_DIMS_PX,
        globalRootY
    );
    tilemap.tile(textureMap[chunkCodes[2]],
        globalRootX,
        globalRootY + TILE_QUADRANT_DIMS_PX
    );
    tilemap.tile(textureMap[chunkCodes[3]],
        globalRootX + TILE_QUADRANT_DIMS_PX,
        globalRootY + TILE_QUADRANT_DIMS_PX
    );
    const plane = new SimplePlane(Texture.WHITE,FULL_TILE_DIMS_PX,FULL_TILE_DIMS_PX);
    plane.x = globalRootX;
    plane.y = globalRootY;
    plane.alpha = 0;
    plane.interactive = true;
    plane.buttonMode = true;
    plane.on("pointerdown", () => {
        console.log(levelObject);
    });
    pixiApp.stage.addChild(plane);
}