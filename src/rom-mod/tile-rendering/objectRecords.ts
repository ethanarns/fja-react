import { LayerOrder, Level, LevelObject, LevelObjectType } from "../RomInterfaces";
import { DrawInstruction } from "./tile-construction-tile-keys";
import { COIN_CHUNK_CODES } from "./drawInstructionRetrieval/coins";

import { drawHorizontalItemWithEnds, drawRepeatingRectangle } from "./drawInstructionRetrieval/commonInstructions";
import { bigBlueRocks } from "./drawInstructionRetrieval/extendedStatics/largeExtendedStatics";
import { drawFlowerSlope_steepest, drawGardenGround, drawGardenSlope_downleft_30, drawGardenSlope_downLeft_45, drawGardenSlope_downright_30, drawGardenSlope_downright_steepest, drawGroundSides } from "./drawInstructionRetrieval/ground/flowerGround";
import { generateStoneBlocks } from "./drawInstructionRetrieval/blocks/stoneBlocks";

export type InstructionGenerator = (levelObject: LevelObject, level: Level, romBuffer: Uint8Array) => DrawInstruction[];

export interface ObjectRecord {
    objectType: LevelObjectType;
    isExtended: boolean;
    objectId: number;
    instructionFunction: InstructionGenerator;
    prettyName?: string;
    textDescription?: string;
};

export const OBJECT_RECORDS: ObjectRecord[] = [
    {
        objectType: "static",
        isExtended: false,
        objectId: 0x3c,
        instructionFunction: () => [],
        prettyName: "Green Pipe Down Usable",
        textDescription: "This green pipe does not require an additional object to enable its transportation property. Its destination is affected by its quadrant position. You can flip it upside down by setting the Z dimension to a negative number."
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0x63,
        instructionFunction: lo => drawHorizontalItemWithEnds(lo,
            "108c,108d,109c,109d",
            "108d,108d,109d,109d",
            "108d,108e,109d,109e",
            LayerOrder.PLATFORMS
        ),
        prettyName: "Platform Brown Zig-Zag",
        textDescription: "A common platform, it is decorated with a brown zig-zag pattern."
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0x67,
        instructionFunction: (lo, level) => {
            const tileset = level.headers.tileset;
            let chunkCodes = "Unknown ground";
            // ground1_fill
            const normalFill = "406f,407e,407f,406e";
            // flower_ground_fill_1
            const flowerGroundFill = "4500,4500,4500,4500";
            switch (tileset) {
                case 0xC:
                    chunkCodes = flowerGroundFill;
                    break;
                case 0x7:
                    chunkCodes = normalFill;
                    break;
                default:
                    chunkCodes = normalFill;
                    break;
            }
            return drawRepeatingRectangle(lo, chunkCodes, LayerOrder.GROUND_FILL);
        }
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0x68,
        instructionFunction: (lo) => drawRepeatingRectangle(lo,COIN_CHUNK_CODES,LayerOrder.COINS),
        prettyName: "Yellow Coins - Single Spaced Rectangle"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0x6c,
        instructionFunction: (lo,level,romBuffer) => generateStoneBlocks(lo, level, romBuffer, false),
        prettyName: "Stone Blocks - Monocolored"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0x6e,
        instructionFunction: (lo,level,romBuffer) => generateStoneBlocks(lo, level, romBuffer, true),
        prettyName: "Stone Blocks - Multicolored"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xd4,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd4"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xd5,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd5"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xd6,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd6"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xd7,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd7"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xd8,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd8"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xd9,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd9"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xda,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xda"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xdb,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xdb"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xdc,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xdc"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xdd,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xdd"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xde,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xde"
    },{
        objectType: "static",
        isExtended: true,
        objectId: 0xdf,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xdf"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0xe4,
        instructionFunction: (lo) => drawGardenGround(lo),
        prettyName: "Flower Ground - Rectangle"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0xe5,
        instructionFunction: (lo) => drawGardenSlope_downleft_30(lo),
        prettyName: "Flower Ground - Down Left 30"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0xe6,
        instructionFunction: (lo) => drawGardenSlope_downLeft_45(lo),
        prettyName: "Flower Ground - Down Left 45"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0xe7,
        instructionFunction: (lo) => drawFlowerSlope_steepest(lo),
        prettyName: "Flower Ground - Left 1 Down 2"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0xe8,
        instructionFunction: (lo) => drawGardenSlope_downright_30(lo),
        prettyName: "Flower Ground - Right 2 Down 1"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0xe9,
        instructionFunction: (lo) => drawGardenSlope_downright_steepest(lo),
        prettyName: "Flower Ground - Down 1 Right 1"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0xea,
        instructionFunction: (lo) => drawFlowerSlope_steepest(lo),
        prettyName: "Flower Ground - Right 1 Down 2"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0xeb,
        instructionFunction: (lo) => drawGroundSides(lo),
        prettyName: "Flower Ground - Edge Left"
    },{
        objectType: "static",
        isExtended: false,
        objectId: 0xec,
        instructionFunction: (lo) => drawGroundSides(lo),
        prettyName: "Flower Ground - Edge Right"
    }
];