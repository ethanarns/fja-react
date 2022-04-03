import { TILE_QUADRANT_DIMS_PX } from "../../GLOBALS";
import { Level } from "../RomInterfaces";
import "./tile-construction-tile-keys"
import { RenderedTileDataName, RENDERED_TILE_DEFAULTS, TileChunkPreRenderData } from "./tile-construction-tile-keys";

export function generateTilesheet(texMan: Phaser.Textures.TextureManager, level: Level): string[] {
    if (!level.palettes) {
        console.log("ERROR: No palettes attached to level!",level);
        return [];
    }
    const allChunkCodes = getAllChunkCodes();
    allChunkCodes.forEach(chunkCode => {
        addTextureFromChunk(chunkCode,texMan,level);
    });
    
    return allChunkCodes;
}

/**
 * Goes through all known chunk codes and returns the unique, valid ones
 * @returns A list of every known Chunk code
 */
function getAllChunkCodes(): string[] {
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

function addTextureFromChunk(code: string, texMan: Phaser.Textures.TextureManager, level: Level): void {
    const chunkNum = parseInt(code, 16);
    if (code.length !== 4 || isNaN(chunkNum)) {
        console.error("Bad code passed to addTextureFromChunk:", code);
        return;
    }
    if (!level.palettes) {
        console.error("Level does not have valid palettes:",level);
        return;
    }
    const chunkPreRenderData = getChunkFromNumber(chunkNum);
    const texture_name = code;
    // let tex: Phaser.Textures.CanvasTexture;
    // if (texMan.get(texture_name) !== undefined) {
    //     tex = texMan.get;
    // } else {
    //     tex = texMan.createCanvas(texture_name, TILE_QUADRANT_DIMS_PX, TILE_QUADRANT_DIMS_PX);
    // }
    const tex = texMan.createCanvas(texture_name, TILE_QUADRANT_DIMS_PX, TILE_QUADRANT_DIMS_PX);
    const ctx = tex.context;
    const spritePixels = level.availableSpriteTiles[chunkPreRenderData.tileId];
    const palette = level.palettes[chunkPreRenderData.paletteId];
    let pixelValueIndex = 0;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const pixelValue = spritePixels[pixelValueIndex];
            pixelValueIndex++;
            if (pixelValue !== 0) {
                const color = palette[pixelValue];
                ctx.fillStyle = color;
                let xPos = chunkPreRenderData.flipH ? (8-x-1) : x;
                let yPos = chunkPreRenderData.flipV ? (8-y-1) : y;
                let rectX = xPos;
                let rectY = yPos;
                ctx.fillRect(rectX,rectY,1,1);
            }
        }
    }
    if(pixelValueIndex !== 64) {
        console.error("Did not create 64 pixels");
        return;
    }
    tex.refresh();
}