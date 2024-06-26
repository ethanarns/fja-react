/**
 * This file contains the logic that converts chunk codes into Graphics/Textures
 * It does not handle anything related to object placement or Pixi logic. Just
 * the RenderTextures (and Graphics used as intermediary canvases)
 */

import { Level, ORDER_PRIORITY_SPRITE } from "../RomInterfaces";
import { Graphics, RenderTexture, Application, Text, TextStyle, Rectangle } from "pixi.js";
import { RenderedTileDataName, RENDERED_TILE_DEFAULTS, TileChunkPreRenderData } from "./tile-construction-tile-keys";
import { FULL_TILE_DIMS_PX, TILE_QUADRANT_DIMS_PX } from "../../GLOBALS";

export let INVERT_CACHE: Record<string,RenderTexture> = {};
export let BUILTIN_CHUNK_CODES: string[] = [];

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

export interface ChunkRenderOptions {
    invert: boolean;
}

export function getGraphicFromChunkCode(code: string, level: Level, opts?: ChunkRenderOptions): Graphics {
    const chunkNum = parseInt(code, 16);
    if (code.length !== 4 || isNaN(chunkNum)) {
        console.error("Bad code passed to addTextureFromChunk:", code);
        return new Graphics();
    }
    return getGraphicFromChunkData(getChunkFromNumber(chunkNum),level,opts);
}

export function getGraphicFromChunkData(chunkPreRenderData: TileChunkPreRenderData, level: Level, opts?: ChunkRenderOptions): Graphics {
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
                let color = convertRgbToHex(palette[pixelValue]);
                if (opts && opts.invert) {
                    color = 0xffffff - color;
                }
                pixiGraphic.beginFill(color);
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
    blankWhiteGraphics.zIndex = ORDER_PRIORITY_SPRITE;
    blankWhiteGraphics.beginFill(0xffffff);
    blankWhiteGraphics.drawRect(0, 0, TILE_QUADRANT_DIMS_PX, TILE_QUADRANT_DIMS_PX);
    blankWhiteGraphics.endFill();

    const invisibleGraphics = new Graphics();

    const underlineGraphics = new Graphics();
    underlineGraphics.zIndex = ORDER_PRIORITY_SPRITE;
    underlineGraphics.lineStyle(1, 0xFFFFFF, 1);
    underlineGraphics.moveTo(0,TILE_QUADRANT_DIMS_PX-1);
    underlineGraphics.lineTo(TILE_QUADRANT_DIMS_PX,TILE_QUADRANT_DIMS_PX-1);
    underlineGraphics.lineStyle(1, 0x000000, 1);
    underlineGraphics.moveTo(0,TILE_QUADRANT_DIMS_PX);
    underlineGraphics.lineTo(TILE_QUADRANT_DIMS_PX,TILE_QUADRANT_DIMS_PX);

    let ret: Record<string,RenderTexture> = {
        "WHTE": pixiApp.renderer.generateTexture(blankWhiteGraphics),
        "BLNK": pixiApp.renderer.generateTexture(invisibleGraphics),
        
        "YCBL": RenderTexture.from("cached/yc_bottomLeft.png") as RenderTexture,
        "YCBR": RenderTexture.from("cached/yc_bottomRight.png") as RenderTexture,
        "YCTL": RenderTexture.from("cached/yc_topLeft.png") as RenderTexture,
        "YCTR": RenderTexture.from("cached/yc_topRight.png") as RenderTexture,

        "RCBL": RenderTexture.from("cached/rc_bottomLeft.png") as RenderTexture,
        "RCBR": RenderTexture.from("cached/rc_bottomRight.png") as RenderTexture,
        "RCTL": RenderTexture.from("cached/rc_topLeft.png") as RenderTexture,
        "RCTR": RenderTexture.from("cached/rc_topRight.png") as RenderTexture,

        "UNDL": pixiApp.renderer.generateTexture(underlineGraphics, {
            // Multiply width by 2 to give a blank secondary area
            region: new Rectangle(0,0,TILE_QUADRANT_DIMS_PX*2,TILE_QUADRANT_DIMS_PX)
        })
    };
    BUILTIN_CHUNK_CODES = Object.keys(ret);
    const style = new TextStyle({
        fontSize: 9,
        stroke: '#FFFFFF',
        strokeThickness: 2,
        fontWeight: 'bolder'
    });
    invisibleGraphics.destroy();
    blankWhiteGraphics.destroy();
    for (let i = 0; i < 0x1ff; i++) {
        const text = i.toString(16).padStart(3,"0");
        const displayText = i.toString(16).padStart(2,"0");
        const pixiText = new Text(displayText,style);
        pixiText.zIndex = ORDER_PRIORITY_SPRITE;
        const key = "S" + text;
        if (key.length > 4) {
            console.error("Key too long:", key);
        } else {
            ret[key] = pixiApp.renderer.generateTexture(pixiText, {
                // Multiply width by 2 to give a blank secondary area
                region: new Rectangle(0,0,FULL_TILE_DIMS_PX,FULL_TILE_DIMS_PX)
            });
        }
        pixiText.destroy();
    }

    // Inverted underline
    const underlineGraphicsInv = new Graphics();
    underlineGraphicsInv.zIndex = ORDER_PRIORITY_SPRITE;
    underlineGraphicsInv.lineStyle(1, 0xff9966, 1);
    underlineGraphicsInv.moveTo(0,TILE_QUADRANT_DIMS_PX-1);
    underlineGraphicsInv.lineTo(TILE_QUADRANT_DIMS_PX,TILE_QUADRANT_DIMS_PX-1);
    underlineGraphicsInv.lineStyle(1, 0xFF0000, 1);
    underlineGraphicsInv.moveTo(0,TILE_QUADRANT_DIMS_PX);
    underlineGraphicsInv.lineTo(TILE_QUADRANT_DIMS_PX,TILE_QUADRANT_DIMS_PX);
    INVERT_CACHE["UNDL"] = pixiApp.renderer.generateTexture(underlineGraphicsInv, {
        // Multiply width by 2 to give a blank secondary area
        region: new Rectangle(0,0,TILE_QUADRANT_DIMS_PX,TILE_QUADRANT_DIMS_PX)
    });
    underlineGraphicsInv.destroy();

    // Inverted blank white
    const blankGreyGraphics = new Graphics();
    blankGreyGraphics.zIndex = ORDER_PRIORITY_SPRITE;
    blankGreyGraphics.beginFill(0x99ccff);
    blankGreyGraphics.drawRect(0, 0, TILE_QUADRANT_DIMS_PX, TILE_QUADRANT_DIMS_PX);
    blankGreyGraphics.endFill();
    INVERT_CACHE["WHTE"] = pixiApp.renderer.generateTexture(blankGreyGraphics, {
        // Multiply width by 2 to give a blank secondary area
        region: new Rectangle(0,0,TILE_QUADRANT_DIMS_PX,TILE_QUADRANT_DIMS_PX)
    });
    blankGreyGraphics.destroy();

    return ret;
}

export function isDefaultChunkCode(chunkCode: string): boolean {
    return (BUILTIN_CHUNK_CODES.includes(chunkCode) || chunkCode.startsWith("S"));
}