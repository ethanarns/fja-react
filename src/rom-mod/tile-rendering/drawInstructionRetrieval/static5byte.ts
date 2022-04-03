import { DrawInstruction } from "../tile-construction-tile-keys";
import { LayerOrder, Level, LevelObject } from "../../RomInterfaces";
import { drawHorizontalItemWithEnds } from "./commonInstructions";

export default function getStatic5ByteDrawInstuctions(lo: LevelObject, level: Level) : DrawInstruction[] {
    let ret: DrawInstruction[] = [];

    switch(lo.objectId) {
        case 0x63:
            return drawHorizontalItemWithEnds(lo,
                {
                    data: "platform_brown_zig_zag_left",
                    dataType: "quadChunkNamedString"
                },
                {
                    data: "platform_brown_zig_zag_middle",
                    dataType: "quadChunkNamedString"
                },
                {
                    data: "platform_brown_zig_zag_right",
                    dataType: "quadChunkNamedString"
                },
                LayerOrder.PLATFORMS
            );
    }

    return ret;
}