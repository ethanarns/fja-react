import { PALETTE_COMPRESSED_DATA_LIST_PTR, PALETTE_LEVEL_BASE_PTR, PALETTE_SPACER_LIST_PTR_MAYBE, PALETTE_WORLD_LIST_BASE_PTR } from "../../GLOBALS";
import { Level } from "../RomInterfaces";
import { readAddress } from "../binaryUtils/binary-io";

/**
 * Retrieves palette color data from specified level and world.
 * 
 * Note: This was converted from my C++ version of the project, could use
 * some optimization...
 * @param romBuffer ROM data to pull data from
 * @param level Level to get data from
 */
export function getPaletteData(romBuffer: Uint8Array, level: Level): string[][] {
    let resultArray: number[] = [];

    const indexOfWorldPalettePoleter = PALETTE_WORLD_LIST_BASE_PTR + level.world*4;
    const baseOfWorldPaletteDataList = readAddress(romBuffer,indexOfWorldPalettePoleter);
    const WORLD_PALETTE_LENGTH: number = 0x200;
    for (let worldPaletteIndex = 0; worldPaletteIndex < WORLD_PALETTE_LENGTH; worldPaletteIndex += 2) {
        resultArray.push(romBuffer[baseOfWorldPaletteDataList+worldPaletteIndex]);
        resultArray.push(romBuffer[baseOfWorldPaletteDataList+worldPaletteIndex+1]);
    }

    /****************************************
     ** Level-specific palette overwriting ** 
    ****************************************/

    const data_6a96 = romBuffer[PALETTE_LEVEL_BASE_PTR + level.levelId];
    const data_4b9c = level.headers.backgroundColor;
    //const data_4b9e = l.headers.tileset;
    const data_4ba0 = level.headers.layer1palette;
    //const data_4ba2 = l.headers.layer2image;
    const data_4ba4 = level.headers.layer2palette;
    //const data_4ba6 = l.headers.layer3type;
    const data_4ba8 = level.headers.layer3palette;
    //const data_4baa = l.headers.spriteSet;
    const data_4bac = level.headers.spritePalette;
    //const data_4bb4 = l.headers.foregroundPosition;
    const data_399e = data_4b9c << 1;

    /*
    * Retrieve global variables from ROM
    */

    const layer3paletteBase = 0x00167384;
    const data_39a4 = romBuffer[layer3paletteBase + (data_4ba8 * 2)] +
        (romBuffer[layer3paletteBase + (data_4ba8 * 2) + 1 ] << 8);

    const layer1paletteBase = 0x00167284;
    const data_39a0 = romBuffer[layer1paletteBase + (data_4ba0 * 2)] +
        (romBuffer[layer1paletteBase + (data_4ba0 * 2) + 1] << 8);

    const layer1paletteOffset = 0x3c;
    const data_39a8 = data_39a0 + layer1paletteOffset;

    const layer2paletteBase = 0x00167304;
    const data_39a2 = romBuffer[layer2paletteBase + (data_4ba4 * 2)] +
        (romBuffer[layer2paletteBase + (data_4ba4 * 2) + 1 ] << 8);

    const spritePaletteBase = 0x00167404;
    const data_39a6 = romBuffer[spritePaletteBase + (data_4bac * 2)] +
        (romBuffer[spritePaletteBase + (data_4bac * 2) + 1] << 8);

    const data_39aa = romBuffer[spritePaletteBase + (data_6a96 * 2)] +
        (romBuffer[spritePaletteBase + (data_6a96 * 2) + 1] << 8);

    /*
    * Everything set up. Start the loop!
    */
    let offsetToReadFromListIndex = PALETTE_SPACER_LIST_PTR_MAYBE;
    // uVar5 in ghidra, but renamed
    let compressedDataIndexOffset = romBuffer[offsetToReadFromListIndex];
    let endCheck = 0;
    const ERROR_CUTOFF = 10;
    let cutoffIndex = 0;

    let data_29d8 = 0;
    let data_29dc = 0;
    let data_29e0 = 0;

    // This is the top list, that checks uVar6 != 0xffff
    while (endCheck !== 0xffff) {
        offsetToReadFromListIndex += 2; // Move index to first object
        data_29d8 = ((romBuffer[offsetToReadFromListIndex+2]) & 0xf);
        data_29dc = ((romBuffer[offsetToReadFromListIndex+2]) & 0xf0) >> 4;
        data_29e0 = (romBuffer[offsetToReadFromListIndex]) << 1;
        offsetToReadFromListIndex += 4; // Correct!

        switch(cutoffIndex) {
            case 0:
                break;
            case 1:
                compressedDataIndexOffset = data_399e;
                break;
            case 2:
                compressedDataIndexOffset = data_39a4;
                break;
            case 3:
                compressedDataIndexOffset = data_39a0;
                break;
            case 4:
                compressedDataIndexOffset = data_39a8;
                break;
            case 5:
                compressedDataIndexOffset = data_39a2;
                break;
            case 6:
                compressedDataIndexOffset = data_39a6;
                break;
            case 7:
                compressedDataIndexOffset = data_39aa;
                break;
            default:
                break;
        }

        let uVar3 = 0;
        let uVar4 = 0;
        let uVar6 = 0;
        // Equivalent CMP at 0x08013ed0 (This is a fallback)
        if (data_29dc !== 0) {
            do {
                uVar4 = data_29e0 >> 1; // Correct!
                uVar3 = 0;
                uVar6++;
                if (data_29d8 !== 0) { // 0x08013ef4
                    do {
                        // Note, on 1-1, the max location for writing was 0x020105fe,
                        //   so allocate 0201 0400-0201 0600, aka 400-600, so **0-200**
                        let locationToPull = PALETTE_COMPRESSED_DATA_LIST_PTR + compressedDataIndexOffset;
                        let locationToWrite = (uVar4 << 1);
                        resultArray[locationToWrite] = romBuffer[locationToPull];
                        resultArray[locationToWrite+1] = romBuffer[locationToPull+1];
                        compressedDataIndexOffset += 2;
                        uVar4++;
                        uVar3++;
                    } while (uVar3 < data_29d8); // 0x08013f26
                }
                data_29e0 += 0x20;
            } while (uVar6 < data_29dc); // 0x08013f42
        }
        endCheck = (romBuffer[offsetToReadFromListIndex]) + (romBuffer[offsetToReadFromListIndex+1] << 8);
        
        // Just in case
        if (cutoffIndex > ERROR_CUTOFF) {
            console.error("Too many loops!");
            return [];
        }
        cutoffIndex++;
    }

    /*************************************
     ** Copying certain rows to the end **
    *************************************/
    const writeOffset = 0x1a0;
    for (let copyOffset = 0x40; copyOffset < (0x40+0x20); copyOffset++) {
        resultArray[copyOffset+writeOffset] = resultArray[copyOffset];
    }

    let palettes: string[][] = [[]];
    let paletteIndex = 0;
    let paletteColorIndex = 0;

    const COLOR_MULT = 8.23;

    for (let writtenIndex = 0; writtenIndex < 0x200; writtenIndex += 2) {
        let colorBytes = (resultArray[writtenIndex+1] << 8) + resultArray[writtenIndex];
        let red = colorBytes & 0b000000000011111;
        red = Math.floor(red*COLOR_MULT);

        let green = (colorBytes & 0b000001111100000) >> 5;
        green = Math.floor(green*COLOR_MULT);

        let blue = (colorBytes & 0b111110000000000) >> 10;
        blue = Math.floor(blue*COLOR_MULT);
        palettes[paletteIndex].push(`rgb(${red},${green},${blue})`);
        paletteColorIndex++;
        if (paletteColorIndex > 15) {
            paletteIndex++;
            paletteColorIndex = 0;
            palettes.push([]);
        }
    }
    return palettes;
}