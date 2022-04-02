import { TILE_BYTES } from "../../GLOBALS";
import { TilePixelData } from "../RomInterfaces";
import "./binary-io"
import { readAddress, readAddressFromArray } from "./binary-io";
import lz77decomp from "./lz77";

function getTilesFromArray16(destArray: number[]): TilePixelData[] {
    let tileList: TilePixelData[] = [];
    for (let i = 0; i < (0x1000/TILE_BYTES); i++) {
        let t: TilePixelData = [];
        let pixelIndex = 0;
        for (let j = 0; j < TILE_BYTES; j++) {
            let index = (i*TILE_BYTES) + j;
            let curByte = destArray[index];
            let first = curByte % 0x10;
            let second = curByte >> 4;
            t[pixelIndex] = first;
            t[pixelIndex+1] = second;
            pixelIndex += 2;
        }
        tileList.push(t);
    }
    return tileList;
}

export function getCombinedSpriteTiles(romBuffer: Uint8Array, tilesetValue: number): TilePixelData[] {
    // Executed at 0x080134e4, original value 0x0823d378, writes to 0x06000000
    // For 1-3, this is 0823ffac, 1-1 is 0823d378, 2-1 is 0823ffac
    const BG_TILE_DATA_COMPRESSED_FIRST  = getTilesetAddress(romBuffer, tilesetValue,0);
    // Executed at 0x0801350c, original value 0x0824a070, writes to 0x06001000, seems not to change
    const BG_TILE_DATA_COMPRESSED_SECOND = 0x0024a070;
    // Executed at 0x08013568, original value 0x08234278, writes to 0x06002000
    const BG_TILE_DATA_COMPRESSED_THIRD  = getTilesetAddress(romBuffer, tilesetValue,2);
    // Executed at 0x080135ae, original value 0x08234eb0, writes to 0x06003000
    const BG_TILE_DATA_COMPRESSED_FOURTH = getTilesetAddress(romBuffer, tilesetValue,3);
    // Executed at 0x080134ec, original value 0x0824c2bc, writes to 0x06004a00
    const BG_TILE_DATA_COMPRESSED_FIFTH = 0x0024c2bc;

    const first = lz77decomp(romBuffer, BG_TILE_DATA_COMPRESSED_FIRST,0x1000);
    const second = lz77decomp(romBuffer, BG_TILE_DATA_COMPRESSED_SECOND,0x1000);
    const third = lz77decomp(romBuffer, BG_TILE_DATA_COMPRESSED_THIRD,0x1000);
    const fourth = lz77decomp(romBuffer, BG_TILE_DATA_COMPRESSED_FOURTH,0x1000);
    const firstTiles = getTilesFromArray16(first);
    const secondTiles = getTilesFromArray16(second);
    const thirdTiles = getTilesFromArray16(third);
    const fourthTiles = getTilesFromArray16(fourth);
    let total = firstTiles.concat(secondTiles).concat(thirdTiles).concat(fourthTiles);
    // Now add blank ones at 06004000-060049e0. Confirmed 80 of them
    for (let i = 0; i < 80; i++) {
        // Add an array of zeros for the random animated ones
        //total.push(Array.apply(null,Array(64)).map(() => 0));
        total.push([
            0,0,0,0,0,0,0,0,
            0,1,0,0,0,0,1,0,
            0,0,1,0,0,1,0,0,
            0,0,0,1,1,0,0,0,
            0,0,0,1,1,0,0,0,
            0,0,1,0,0,1,0,0,
            0,1,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0
        ])
    }
    // This one is partial, but gets where we need. It was only the green pipe
    const fifth = lz77decomp(romBuffer, BG_TILE_DATA_COMPRESSED_FIFTH,0x1000);
    total = total.concat(getTilesFromArray16(fifth));
    return total;
}

/**
 * 
 * @param tilesetValue From the Level Header
 * @param romSection For example, 06002000 = 2
 * @returns 
 */
function getTilesetAddress(romBuffer: Uint8Array, tilesetValue: number,romSection: number): number {
    // 0x08165c44
    const baseAddress = 0x00165c44;
    const tilesetOffset = (tilesetValue << 1) + tilesetValue;
    let tilesetOffsetOffset = -1;
    if (romSection === 2) {
        tilesetOffsetOffset = 0;
    } else if (romSection === 3) {
        tilesetOffsetOffset = 1;
    } else if (romSection === 0) {
        tilesetOffsetOffset = 2;
    } else {
        console.error("Unknown romSection",romSection)
    }
    const newAddress = readAddressFromArray(romBuffer,baseAddress,tilesetOffset+tilesetOffsetOffset);
    //console.log("0x08" + newAddress.toString(16));
    const finalAddress = readAddress(romBuffer,newAddress);
    // 1-4 confirmed, 1-1 confirmed!!
    //console.log("0x08" + finalAddress.toString(16));
    return finalAddress;
}