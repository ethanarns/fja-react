import { TILE_QUADRANT_DIMS_PX } from "../../GLOBALS";

export interface ScreenPageTileChunk {
    objUuidFrom: string;
    chunkCode: string;
}

export interface PixelCoordinates {
    globalPixelX: number;
    globalPixelY: number;
}

export default class ScreenPageData {
    public static readonly SCREEN_PAGE_TILE_DIMS = 0x10;
    public static readonly SCREEN_PAGE_CHUNK_DIMS = ScreenPageData.SCREEN_PAGE_TILE_DIMS * 2;
    public static readonly SCREEN_PAGE_PIXEL_DIMS = ScreenPageData.SCREEN_PAGE_CHUNK_DIMS * TILE_QUADRANT_DIMS_PX;

    /**
     * This number is the highest screenpage
     */
    public static readonly MAX_SCREEN_PAGE = 0x7f;

    /**
     * Squares, 00-7F, on the map
     * Bottom left is 0x70, bottom right is 0x7f, top right is 0x0F
     */
    public readonly screenPageId: number;
    // Pixels
    public readonly globalPixelX: number;
    public readonly globalPixelY: number;
    // ScreenPage related
    public readonly screenPageX: number;
    public readonly screenPageY: number;
    // Half-tiles
    public readonly chunkX: number;
    public readonly chunkY: number;
    // Tiles
    public readonly tileX: number;
    public readonly tileY: number;

    /**
     * Just for space preservation. If a ScreenPage is unused, don't waste memory
     * and search processing power looking through it.
     */
    public hasChunkData: boolean = false;

    private chunks: (ScreenPageTileChunk | null)[][] = [];

    constructor(screenPageId: number) {
        this.screenPageId = screenPageId;

        this.screenPageX = screenPageId % 0x10;
        this.screenPageY = Math.floor(screenPageId / 0x10);
        
        this.tileX = this.screenPageX * ScreenPageData.SCREEN_PAGE_TILE_DIMS;
        this.tileY = this.screenPageY * ScreenPageData.SCREEN_PAGE_TILE_DIMS;

        this.chunkX = this.tileX * 2;
        this.chunkY = this.tileY * 2;

        this.globalPixelX = this.chunkX * 8;
        this.globalPixelY = this.chunkY * 8;
    }

    public getGlobalPixelCoordsFromChunkCoords(innerChunkX: number, innerChunkY: number): PixelCoordinates {
        const ret: PixelCoordinates = {
            globalPixelX: this.globalPixelX + innerChunkX * TILE_QUADRANT_DIMS_PX,
            globalPixelY: this.globalPixelX + innerChunkY * TILE_QUADRANT_DIMS_PX
        };
        return ret;
    }

    public static getScreenPageIdFromTileCoords(tileX: number, tileY: number): number {
        tileX = Math.floor(tileX/16);
        tileY = Math.floor(tileY/16);
        return (tileY << 4) + tileX;
    }

    public static generateAllScreenPages(): ScreenPageData[] {
        let ret: ScreenPageData[] = [];

        for ( let i = 0; i <= this.MAX_SCREEN_PAGE; i++) {
            ret.push(new ScreenPageData(i));
        }

        return ret;
    }

    /**
     * Completely deletes all chunk data
     */
    public wipeChunks(): void {
        this.chunks = [];
        this.hasChunkData = false;
    }

    /**
     * Wipes the chunks, fills with empty/null (but indexable) data
     */
    public fillChunks(): void {
        this.chunks = [];
        for (let y = 0; y < ScreenPageData.SCREEN_PAGE_CHUNK_DIMS; y++) {
            for (let x = 0; x < ScreenPageData.SCREEN_PAGE_CHUNK_DIMS; x++) {
                this.chunks[y][x] = null;
            }
        }
        this.hasChunkData = true;
    }

    /**
     * Given chunk-scale xy coordinates, retrieve the ScreenPageTileChunk data
     * @param chunkX Chunk-scale coords
     * @param chunkY Chunk-scale coords
     * @returns ScreenPageTileChunk, null if none
     */
    public getTileChunkDataFromLocalCoords(chunkX: number, chunkY: number): ScreenPageTileChunk | null {
        if (!this.hasChunkData) {
            return null;
        }
        if (chunkX < 0 || chunkY < 0) {
            console.error("ScreenPageChunk location data may not have negatives.");
            return null;
        }
        if (chunkX > ScreenPageData.SCREEN_PAGE_CHUNK_DIMS || chunkY > ScreenPageData.SCREEN_PAGE_CHUNK_DIMS) {
            console.error(`Out of bounds attempt to retrieve data from ScreenPageChunk "${this.screenPageId}"`,chunkX,chunkY);
            return null;
        }
        return this.chunks[chunkY][chunkX];
    }

    public placeTileChunkData(chunkX: number, chunkY: number, newChunk: ScreenPageTileChunk): void {
        if (chunkX < 0 || chunkY < 0) {
            console.error("ScreenPageChunk location data may not have negatives.");
            return;
        }
        if (chunkX > ScreenPageData.SCREEN_PAGE_CHUNK_DIMS || chunkY > ScreenPageData.SCREEN_PAGE_CHUNK_DIMS) {
            console.error(`Out of bounds attempt to set data in ScreenPageChunk "${this.screenPageId}"`, chunkX, chunkY);
            return;
        }
        //
        // Do more checks here
        //
        this.chunks[chunkY][chunkX] = newChunk;
    }
}