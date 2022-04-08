/**
 * This file contains the logic that converts chunk codes into Graphics/Textures
 * It does not handle anything related to object placement or Pixi logic. Just
 * the RenderTextures (and Graphics used as intermediary canvases)
 */

import { Level } from "../RomInterfaces";
import { Graphics, RenderTexture, Application } from "pixi.js";
import { RenderedTileDataName, RENDERED_TILE_DEFAULTS, TileChunkPreRenderData } from "./tile-construction-tile-keys";
import { TILE_QUADRANT_DIMS_PX } from "../../GLOBALS";

/**
 * Goes through all known chunk codes and returns the unique, valid ones
 * @returns A list of every known Chunk code
 */
export function getAllChunkCodes(): string[] {
    let chunkCodes: string[] = [];
    Object.keys(RENDERED_TILE_DEFAULTS).forEach(key => {
        const fullLineString = RENDERED_TILE_DEFAULTS[key as RenderedTileDataName].trim();
        if (fullLineString.startsWith("0x")) {
            // It's an address, ignore it
        } else {
            const codeArray = fullLineString.split(",");
            if (codeArray.length !== 4) {
                console.warn("Unusual code length:", fullLineString);
            } else {
                codeArray.forEach(code => {
                    code = code.trim();
                    if (code.length !== 4) {
                        console.error("Bad code in getAllChunkCodes:", code);
                    } else if (chunkCodes.includes(code)) {
                        // Code already included, skip
                    } else {
                        chunkCodes.push(code.toLowerCase());
                    }
                });
            }
        }
    });
    return chunkCodes;
}

function getChunkFromNumber(tileAttr: number): TileChunkPreRenderData {
    // For more info: LCD VRAM BG Screen Data Format (BG Map)
    const flipV = (tileAttr >> 11) % 2;
    const flipH = (tileAttr >> 10) % 2;
    const result: TileChunkPreRenderData = {
        tileId: tileAttr & 0b1111111111,
        paletteId: tileAttr >> 12,
        flipH: flipH === 1,
        flipV: flipV === 1
    }
    return result;
}

export function getGraphicFromChunkCode(code: string, level: Level): Graphics {
    const chunkNum = parseInt(code, 16);
    if (code.length !== 4 || isNaN(chunkNum)) {
        console.error("Bad code passed to addTextureFromChunk:", code);
        return new Graphics();
    }
    return getGraphicFromChunkData(getChunkFromNumber(chunkNum),level);
}

export function getGraphicFromChunkData(chunkPreRenderData: TileChunkPreRenderData, level: Level): Graphics {
    const pixiGraphic = new Graphics();
    if (!level.palettes) {
        console.error("Level does not have valid palettes:",level);
        return pixiGraphic;
    }
    const spritePixels = level.availableSpriteTiles[chunkPreRenderData.tileId];
    const palette = level.palettes[chunkPreRenderData.paletteId];
    let pixelValueIndex = 0;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const pixelValue = spritePixels[pixelValueIndex];
            pixelValueIndex++;
            if (pixelValue !== 0) {
                const color = palette[pixelValue];
                pixiGraphic.beginFill(convertRgbToHex(color));
                let xPos = chunkPreRenderData.flipH ? (8-x-1) : x;
                let yPos = chunkPreRenderData.flipV ? (8-y-1) : y;
                let rectX = xPos;
                let rectY = yPos;
                pixiGraphic.drawRect(rectX,rectY,1,1);
                pixiGraphic.endFill();
            }
        }
    }
    if(pixelValueIndex !== 64) {
        console.error("Did not create 64 pixels");
        return pixiGraphic;
    }
    return pixiGraphic;
}

function convertRgbToHex(rgb: string): number {
    const noCss = rgb.split("(")[1].split(")")[0];
    const numbers = noCss.split(",");
    const hexNums = numbers.map((x) => {
        x = parseInt(x).toString(16);
        return ( x.length === 1) ? "0" + x : x;
    });
    const strVal = "0x" + hexNums.join("");
    return parseInt(strVal,16);
}

export function getDefaultRenderTextures(pixiApp: Application): Record<string,RenderTexture> {
    const blankWhiteGraphics = new Graphics();
    blankWhiteGraphics.beginFill(0xffffff);
    blankWhiteGraphics.drawRect(0, 0, TILE_QUADRANT_DIMS_PX, TILE_QUADRANT_DIMS_PX);
    blankWhiteGraphics.endFill();
    const ret = {
        "WHTE": pixiApp.renderer.generateTexture(blankWhiteGraphics),
        "YCBL": RenderTexture.from("cached/yc_bottomLeft.png") as RenderTexture,
        "YCBR": RenderTexture.from("cached/yc_bottomRight.png") as RenderTexture,
        "YCTL": RenderTexture.from("cached/yc_topLeft.png") as RenderTexture,
        "YCTR": RenderTexture.from("cached/yc_topRight.png") as RenderTexture
    };
    blankWhiteGraphics.destroy();
    return ret;
}