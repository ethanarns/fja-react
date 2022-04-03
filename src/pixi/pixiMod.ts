import { Graphics, Application } from "pixi.js";
import { Level, LevelObject } from "../rom-mod/RomInterfaces";
import { DrawInstruction, RENDERED_TILE_DEFAULTS } from "../rom-mod/tile-rendering/tile-construction-tile-keys";
import getStatic4ByteDrawInstuctions from "../rom-mod/tile-rendering/drawInstructionRetrieval/static4byte";
import getStatic5ByteDrawInstuctions from "../rom-mod/tile-rendering/drawInstructionRetrieval/static5byte";
import { FULL_TILE_DIMS_PX, TILE_QUADRANT_DIMS_PX } from "../GLOBALS";

export function placeGraphic(graphic: Graphics, globalX: number, globalY: number, pixiApp: Application, chunkCode: string, clickCallback: Function): Graphics {
    console.log(chunkCode,globalX,globalY);
    graphic.x = globalX;
    graphic.y = globalY;
    graphic.interactive = true;
    graphic.buttonMode = true;
    graphic.name = chunkCode;
    graphic.on('pointerdown', () => {
        clickCallback(graphic, chunkCode);
    });
    pixiApp.stage.addChild(graphic);
    return graphic;
}

export function placeLevelObject(lo: LevelObject, level: Level, pixiApp: Application, graphics: Record<string,Graphics>): void {
    const instructions = getDrawInstructionsForObject(lo, level);
    instructions.forEach(instruction => {
        executeInstruction(instruction,pixiApp,lo.xPos,lo.yPos,graphics);
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
    graphics: Record<string,Graphics>
) {
    const trueX = sourceX + instruction.offsetX;
    const trueY = sourceY + instruction.offsetY;
    console.log(trueX,trueY);
    const globalX = trueX * FULL_TILE_DIMS_PX;
    const globalY = trueY * FULL_TILE_DIMS_PX;
    if (instruction.renderData.dataType === "quadChunkNamedString") {
        const quadChunkCodeString = RENDERED_TILE_DEFAULTS[instruction.renderData.data as string];
        placeChunkArray(globalX,globalY,quadChunkCodeString.split(","),graphics,pixiApp);
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
    graphics: Record<string,Graphics>,
    pixiApp: Application
): void {
    if (chunkCodes.length !== 4) {
        console.error("Bad chunk code array:", chunkCodes);
        return;
    }
    placeGraphic(graphics[chunkCodes[0]],globalRootX,globalRootY,pixiApp,chunkCodes[0],() => {});
    placeGraphic(graphics[chunkCodes[1]],globalRootX + TILE_QUADRANT_DIMS_PX,globalRootY,pixiApp,chunkCodes[1],() => {});
    placeGraphic(graphics[chunkCodes[2]],globalRootX,globalRootY + TILE_QUADRANT_DIMS_PX,pixiApp,chunkCodes[2],() => {});
    placeGraphic(graphics[chunkCodes[3]],globalRootX + TILE_QUADRANT_DIMS_PX,globalRootY + TILE_QUADRANT_DIMS_PX,pixiApp,chunkCodes[3],() => {});
}