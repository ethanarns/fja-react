import { LayerOrder, Level, LevelObject, LevelObjectType } from "../RomInterfaces";
import { drawHorizontalItemWithEnds } from "./drawInstructionRetrieval/commonInstructions";
import { DrawInstruction } from "./tile-construction-tile-keys";

export type InstructionGenerator = (levelObject: LevelObject, level: Level) => DrawInstruction[];

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
    }
];