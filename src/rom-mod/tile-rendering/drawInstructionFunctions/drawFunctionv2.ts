import { Level, LevelObjectType, ObjectStorageType } from "../../RomInterfaces";

/**
 * Example: "406f,407e,407f,406e"
 * Made up of example 4 chunkrendercodes
 * @see ChunkRenderCode
 */
export type ChunkRenderCodeGroup = string;

/**
 * Example: "4166" or "40ee"
 */
export type ChunkRenderCode = string;

/**
 * Example: 0x151E (brown platform left)
 * Examples into ChunkRenderCodeGroup
 * @see ChunkRenderCodeGroup
 */
export type TileRenderCode = number;

export type DrawInstructionFunction = (lo: LevelObjectData, overlappingTile: TileRenderCode | undefined, curTileOffsetX: number, curTileOffsetY: number, level: Level, romBuffer: Uint8Array, options?: DrawInstructionOptions) => TileRenderCode;

export interface LevelObjectData {
    objectType: LevelObjectType;
    objectStorage: ObjectStorageType;
    objectId: number;
    dimX: number;
    dimY: number;
    direction: "vertical" | "horizontal" | "rectangular";
    tileXpos: number;
    tileYpos: number;
    originalOffset16?: string;
    uuid: string;
}

export interface DrawInstructionOptions {

}

// 0x080233ac
export function rt_BrownPlatform(lo: LevelObjectData, overlappingTile: TileRenderCode | undefined, curTileOffsetX: number, curTileOffsetY: number, level: Level, romBuffer: Uint8Array, options?: DrawInstructionOptions): TileRenderCode {
    if (curTileOffsetX === 0) {
        return 0x151E; // Left side of platform
    } else if (curTileOffsetX + 1 === lo.dimX){
        return 0x1520; // Right side of platform
    } else {
        return 0x151f; // Middle of platform
    }
}

// 0x08025e8c
export function rt_greenPipe(lo: LevelObjectData, overlappingTile: TileRenderCode | undefined, curTileOffsetX: number, curTileOffsetY: number, level: Level, romBuffer: Uint8Array, options?: DrawInstructionOptions): TileRenderCode {
    const is80ortaller = lo.dimY >= 0x80;
    const isLip = false;
    let tileBaseAddr = -1;
    if (is80ortaller) {
        // upside-down
        if (curTileOffsetX === 0) {
            // left
        } else {
            // right
        }
    } else {
        // rightside-up
        if (curTileOffsetX === 0) {
            // left
        } else {
            // right
        }
    }
    return 0;
}

// 0x08028a68
export function rt_groundInset(lo: LevelObjectData, overlappingTile: TileRenderCode | undefined, curTileOffsetX: number, curTileOffsetY: number, level: Level, romBuffer: Uint8Array, options?: DrawInstructionOptions): TileRenderCode {
    return 0;
}