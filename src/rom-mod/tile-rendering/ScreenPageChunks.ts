import { CompositeTilemap } from "@pixi/tilemap";
import { Application } from "pixi.js";
import { FULL_TILE_DIMS_PX, TILEMAP_ID, TILE_QUADRANT_DIMS_PX } from "../../GLOBALS";
import { LayerOrder } from "../RomInterfaces";
import { DrawInstruction } from "./tile-construction-tile-keys";

export interface ScreenPageTileChunk {
    objUuidFrom: string;
    chunkCode: string;
    layer: LayerOrder;
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

    public tilemap: CompositeTilemap;

    private chunks: (ScreenPageTileChunk[] | null)[][] = [];

    constructor(screenPageId: number, pixiApp: Application) {
        this.screenPageId = screenPageId;

        this.screenPageX = screenPageId % 0x10;
        this.screenPageY = Math.floor(screenPageId / 0x10);
        
        this.tileX = this.screenPageX * ScreenPageData.SCREEN_PAGE_TILE_DIMS;
        this.tileY = this.screenPageY * ScreenPageData.SCREEN_PAGE_TILE_DIMS;

        this.chunkX = this.tileX * 2;
        this.chunkY = this.tileY * 2;

        this.globalPixelX = this.chunkX * 8;
        this.globalPixelY = this.chunkY * 8;

        this.tilemap = new CompositeTilemap();
        this.tilemap.name = TILEMAP_ID + screenPageId.toString(16);
        this.tilemap.x = this.globalPixelX;
        this.tilemap.y = this.globalPixelY;
        this.tilemap.width = ScreenPageData.SCREEN_PAGE_TILE_DIMS * FULL_TILE_DIMS_PX;
        this.tilemap.height = ScreenPageData.SCREEN_PAGE_TILE_DIMS * FULL_TILE_DIMS_PX;
        pixiApp.stage.addChild(this.tilemap);
    }

    public getGlobalPixelCoordsFromChunkCoords(innerChunkX: number, innerChunkY: number): PixelCoordinates {
        const ret: PixelCoordinates = {
            globalPixelX: this.globalPixelX + innerChunkX * TILE_QUADRANT_DIMS_PX,
            globalPixelY: this.globalPixelY + innerChunkY * TILE_QUADRANT_DIMS_PX
        };
        return ret;
    }

    public static getScreenPageIdFromTileCoords(tileX: number, tileY: number): number {
        tileX = Math.floor(tileX/16);
        tileY = Math.floor(tileY/16);
        return (tileY << 4) + tileX;
    }

    public static generateAllScreenPages(pixiApp: Application): ScreenPageData[] {
        let ret: ScreenPageData[] = [];

        for ( let i = 0; i <= this.MAX_SCREEN_PAGE; i++) {
            ret.push(new ScreenPageData(i,pixiApp));
        }

        return ret;
    }

    /**
     * Completely deletes all chunk data
     */
    public wipeChunks(): void {
        this.chunks = [[]];
        this.hasChunkData = false;
    }

    /**
     * Wipes the chunks, fills with empty/null (but indexable) data
     */
    public fillChunks(): void {
        this.chunks = [];
        for (let y = 0; y < ScreenPageData.SCREEN_PAGE_CHUNK_DIMS; y++) {
            this.chunks.push([])
            for (let x = 0; x < ScreenPageData.SCREEN_PAGE_CHUNK_DIMS; x++) {
                this.chunks[y].push(null);
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
    public getTileChunkDataFromLocalCoords(chunkX: number, chunkY: number): ScreenPageTileChunk[] | null {
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
        const ys = this.chunks[chunkY];
        if (!ys) {
            return null;
        }
        if (!ys[chunkX]) {
            return null;
        }
        return ys[chunkX];
    }

    public wipeCheck(): void {
        let shouldKeep = false;
        this.chunks.forEach(subChunks => {
            subChunks.forEach(chunkData => {
                if (chunkData !== null) {
                    if (chunkData.length > 0) {
                        shouldKeep = true;
                    } else {
                        // It's an empty array, just null it
                        chunkData = null;
                    }
                }
            });
        });
        if (!shouldKeep) {
            this.wipeChunks();
        }
    }

    /**
     * Attempt to place a tile onto an existing section
     * @param chunkX Chunk-scale coords
     * @param chunkY Chunk-scale coords
     * @param newChunk ScreenPageTileChunk to place
     */
    public placeTileChunkData(chunkX: number, chunkY: number, newChunk: ScreenPageTileChunk): void {
        if (chunkX < 0 || chunkY < 0) {
            console.error("ScreenPageChunk location data may not have negatives.");
            return;
        }
        if (chunkX > ScreenPageData.SCREEN_PAGE_CHUNK_DIMS || chunkY > ScreenPageData.SCREEN_PAGE_CHUNK_DIMS) {
            console.error(`Out of bounds attempt to set data in ScreenPageChunk "${this.screenPageId}"`, chunkX, chunkY);
            return;
        }
        if (!this.hasChunkData) {
            this.fillChunks();
            this.hasChunkData = true;
        }
        // It's null, make and add it
        if (this.chunks[chunkY][chunkX] === null) {
            this.chunks[chunkY][chunkX] = [newChunk];
            return;
        }
        this.chunks[chunkY][chunkX]!.push(newChunk);
    }

    public tileInstruction(relativeTileX: number, relativeTileY: number, instruction: DrawInstruction): void {
        if (
            relativeTileX < 0 ||
            relativeTileX >= ScreenPageData.SCREEN_PAGE_TILE_DIMS ||
            relativeTileY < 0 ||
            relativeTileY >= ScreenPageData.SCREEN_PAGE_TILE_DIMS
        ) {
            console.error("Bad coords in placeTile:",relativeTileX, relativeTileY);
            return;
        }
        // Each tile is a 2x2 square of chunks
        const relativeChunkXbase = relativeTileX * 2;
        const relativeChunkYbase = relativeTileY * 2;
        instruction.renderCodes.split(",").forEach((code, index) => {
            const newChunk: ScreenPageTileChunk = {
                objUuidFrom: instruction.uniqueLevelObjectId,
                chunkCode: code,
                layer: instruction.layer
            };
            if (index === 0) {
                this.placeTileChunkData(
                    relativeChunkXbase,
                    relativeChunkYbase,
                newChunk);
            } else if (index === 1) {
                this.placeTileChunkData(
                    relativeChunkXbase + 1,
                    relativeChunkYbase,
                newChunk);
            } else if (index === 2) {
                this.placeTileChunkData(
                    relativeChunkXbase,
                    relativeChunkYbase + 1,
                newChunk);
            } else if (index === 3) {
                this.placeTileChunkData(
                    relativeChunkXbase + 1,
                    relativeChunkYbase + 1,
                newChunk);
            } else {
                console.error("Bad index in placeTile:",index);
            }
        })
    }
}