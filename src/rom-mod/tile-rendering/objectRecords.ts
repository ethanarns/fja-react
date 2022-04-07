import { LayerOrder, Level, LevelObject, LevelObjectType } from "../RomInterfaces";
import { drawHorizontalItemWithEnds } from "./drawInstructionRetrieval/commonInstructions";
import { DrawInstruction } from "./tile-construction-tile-keys";
import { bigBlueRocks } from "./drawInstructionRetrieval/largeExtendedStatics";

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
        objectId: 0x63,
        instructionFunction: lo => drawHorizontalItemWithEnds(lo,
            "108c,108d,109c,109d",
            "108d,108d,109d,109d",
            "108d,108e,109d,109e",
            LayerOrder.PLATFORMS
        ),
        prettyName: "Platform Brown Zig-Zag",
        textDescription: "A common platform, it is decorated with a brown zig-zag pattern."
    },
    {
        objectType: "static",
        isExtended: false,
        objectId: 0x3c,
        instructionFunction: () => [],
        prettyName: "Green Pipe Down Usable",
        textDescription: "This green pipe does not require an additional object to enable its transportation property. Its destination is affected by its quadrant position. You can flip it upside down by setting the Z dimension to a negative number."
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xd4,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd4"
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xd5,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd5"
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xd6,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd6"
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xd7,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd7"
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xd8,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd8"
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xd9,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xd9"
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xda,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xda"
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xdb,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xdb"
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xdc,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xdc"
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xdd,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xdd"
    },
    {
        objectType: "static",
        isExtended: true,
        objectId: 0xde,
        instructionFunction: (lo,level,romBuffer) => bigBlueRocks(lo,level,romBuffer),
        prettyName: "Big Blue Rock: 0xde"
    }
];