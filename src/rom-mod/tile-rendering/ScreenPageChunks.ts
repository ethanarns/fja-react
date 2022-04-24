import { CompositeTilemap } from "@pixi/tilemap";
import { Application, Container, Graphics, Text } from "pixi.js";
import { FULL_TILE_DIMS_PX, NAV_CONTAINER, SCREEN_PAGE_LINE_COLOR, TILEMAP_ID, TILE_QUADRANT_DIMS_PX } from "../../GLOBALS";
import { Level, LevelObject } from "../RomInterfaces";
import { DrawInstruction } from "./tile-construction-tile-keys";

export type ChunkEffect = "normal" | "inverted";

export interface ScreenPageTileChunk {
    objUuidFrom: string;
    chunkCode: string;
    layer: number;
    effect: ChunkEffect;
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
    private bg: Graphics;

    /**
     * There is only one chunk per chunk coordinate. New ones overwrite old ones
     */
    private chunks: (ScreenPageTileChunk | null)[][] = [];

    constructor(screenPageId: number, pixiApp: Application) {
        const navContainer = pixiApp.stage.getChildByName(NAV_CONTAINER) as Container;

        this.screenPageId = screenPageId;

        this.screenPageX = screenPageId % 0x10;
        this.screenPageY = Math.floor(screenPageId / 0x10);
        
        this.tileX = this.screenPageX * ScreenPageData.SCREEN_PAGE_TILE_DIMS;
        this.tileY = this.screenPageY * ScreenPageData.SCREEN_PAGE_TILE_DIMS;

        this.chunkX = this.tileX * 2;
        this.chunkY = this.tileY * 2;

        this.globalPixelX = this.chunkX * 8;
        this.globalPixelY = this.chunkY * 8;

        this.bg = new Graphics();

        // Draw bottom and right lines
        this.bg.lineStyle(2, SCREEN_PAGE_LINE_COLOR);
        const lineDim = ScreenPageData.SCREEN_PAGE_TILE_DIMS * FULL_TILE_DIMS_PX-1;
        this.bg.moveTo(0,lineDim);
        this.bg.lineTo(lineDim,lineDim);
        this.bg.lineTo(lineDim,0);

        // Add ScreenPage ID
        const spt = new Text("0x" + this.screenPageId.toString(16).padStart(2,"0"), {
            fontSize: 16,
            fill: ['#ffffff'],
            align: "right"
        });
        spt.x = this.globalPixelX + (ScreenPageData.SCREEN_PAGE_TILE_DIMS * FULL_TILE_DIMS_PX) - 38;
        spt.y = this.globalPixelY;
        navContainer.addChild(spt);

        // Add to stage
        this.bg.x = this.globalPixelX;
        this.bg.y = this.globalPixelY;
        navContainer.addChild(this.bg);

        this.tilemap = new CompositeTilemap();
        this.tilemap.name = TILEMAP_ID + screenPageId.toString(16);
        this.tilemap.x = this.globalPixelX;
        this.tilemap.y = this.globalPixelY;
        this.tilemap.width = ScreenPageData.SCREEN_PAGE_TILE_DIMS * FULL_TILE_DIMS_PX;
        this.tilemap.height = ScreenPageData.SCREEN_PAGE_TILE_DIMS * FULL_TILE_DIMS_PX;
        navContainer.addChild(this.tilemap);
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
     * 
     * Does not clear any rendering data
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
                    shouldKeep = true;
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
        if (["BLNK","60ff","40ee"].includes(newChunk.chunkCode.toLowerCase())) {
            return;
        }
        this.chunks[chunkY][chunkX] = newChunk;
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
                objUuidFrom: instruction.uniqueLevelObjectId!,
                chunkCode: code,
                layer: instruction.layer!,
                effect: "normal"
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
        });
    }

    public getAllObjectIds(): string[] {
        if (!this.hasChunkData) {
            return [];
        }
        let ret: string[] = [];
        const yLen = this.chunks.length;
        const xLen = this.chunks[0].length;
        for (let y = 0; y < yLen; y++) {
            for (let x = 0; x < xLen; x++) {
                const chunk = this.chunks[y][x];
                if (chunk) {
                    ret.push(chunk.objUuidFrom);
                    // place.forEach(chunk => {
                    //     const chunkId = chunk.objUuidFrom;
                    //     if (!ret.includes(chunkId)) {
                    //         ret.push(chunkId);
                    //     }
                    // });
                }
            }
        }
        return ret;
    }

    public static getSurroundingIdsFromId(pageId: number): number[] {
        let ret: number[] = [];
        // Are we not on the top row?
        if (pageId > 0x0f) {
            ret.push(pageId - 0x10);
        }
        if (pageId < 0x70) {
            ret.push(pageId + 0x10);
        }
        // Not leftmost?
        if (pageId % 0x10 !== 0) {
            ret.push(pageId - 1);
        }
        // Not rightmost?
        if ((pageId + 1) % 0x10 !== 0) {
            ret.push(pageId + 1);
        }
        return ret;
    }

    public setEffectByObjUuid(objUuid: string, effect: ChunkEffect): void {
        if (!this.hasChunkData) {
            return;
        }
        const yLen = this.chunks.length;
        const xLen = this.chunks[0].length;
        for (let y = 0; y < yLen; y++) {
            for (let x = 0; x < xLen; x++) {
                const place = this.chunks[y][x];
                if (place && place.objUuidFrom === objUuid) {
                    place.effect = effect;
                    // place.forEach(chunk => {
                    //     if (chunk.objUuidFrom === objUuid) {
                    //         chunk.effect = effect;
                    //     }
                    // });
                }
            }
        }
    }

    public removeAllEffectsByEffect(effect: ChunkEffect): void {
        if (!this.hasChunkData) {
            return;
        }
        const yLen = this.chunks.length;
        const xLen = this.chunks[0].length;
        for (let y = 0; y < yLen; y++) {
            for (let x = 0; x < xLen; x++) {
                const place = this.chunks[y][x];
                if (place && place.effect === effect) {
                    place.effect = "normal";
                    // place.forEach(chunk => {
                    //     if (chunk.effect === effect) {
                    //         chunk.effect = "normal";
                    //     }
                    // });
                }
            }
        }
    }

    public static applyEffectToSingleObject(uuid: string, screenPageData: ScreenPageData[], fx: ChunkEffect): void {
        console.debug("applyEffectToSingleObject", uuid);
        screenPageData.forEach(sp1 => {
            sp1.removeAllEffectsByEffect(fx);
        });
        screenPageData.forEach(sp2 => {
            sp2.setEffectByObjUuid(uuid,fx);
        });
    }

    public static getLevelObjectOverlapping(
        curObj: LevelObject,
        tileOffsetX: number,
        tileOffsetY: number,
        screenPages: ScreenPageData[],
        level: Level
    ): LevelObject | undefined {
        const actualTileX = curObj.xPos + tileOffsetX;
        const actualTileY = curObj.yPos + tileOffsetY;
        const spid = ScreenPageData.getScreenPageIdFromTileCoords(actualTileX,actualTileY);
        const foundScreenPages = screenPages.filter(sp => sp.screenPageId === spid);
        if (foundScreenPages.length === 1) {
            const screen = foundScreenPages[0];
            const localTileX = actualTileX - screen.tileX;
            const localTileY = actualTileY - screen.tileY;
            const localChunkX = localTileX * 2;
            const localChunkY = localTileY * 2;
            const foundChunk = screen.getTileChunkDataFromLocalCoords(localChunkX, localChunkY);
            if (foundChunk) {
                const objIndex = level.objects.map(x => x.uuid).indexOf(foundChunk.objUuidFrom);
                if (objIndex !== -1) {
                    return level.objects[objIndex];
                } else {
                    console.error("Object not found with uuid:", foundChunk.objUuidFrom);
                    return undefined;
                }
                // let foundLevelObjects: LevelObject[] = [];
                // foundChunks.forEach(ch => {
                //     const objIndex = level.objects.map(x => x.uuid).indexOf(ch.objUuidFrom);
                //     if (objIndex !== -1) {
                //         foundLevelObjects.push(level.objects[objIndex]);
                //     } else {
                //         console.error("Object not found with uuid:", ch.objUuidFrom);
                //     }
                // });
                // return foundLevelObjects;
            } else {
                console.error("No chunks found!");
                return undefined;
            }
        } else {
            console.error("Found incorrect number of screen pages:", foundScreenPages, spid);
            return undefined;
        }
    }
}