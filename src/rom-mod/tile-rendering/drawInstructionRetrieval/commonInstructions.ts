import { LayerOrder, LevelObject } from "../../RomInterfaces";
import { DrawInstruction, RenderData } from "../tile-construction-tile-keys";

export function drawVerticalItemWithEnds(lo: LevelObject, top: RenderData, middle: RenderData, bottom: RenderData, layer?: LayerOrder): DrawInstruction[] {
    let result: DrawInstruction[] = [];

    if (lo.dimZ === undefined) {
        console.error("No DimZ:",lo);
        return result;
    }
    // Length of zero means only source
    const length = lo.dimZ;
    const trueLayer = layer ? layer : LayerOrder.STANDARD_OBJECTS;

    // Top
    result.push({
        offsetX:0,
        offsetY:0,
        uniqueLevelObjectId: lo.uuid,
        layer: trueLayer,
        renderData: top
    });
    // Bottom
    if (length > 0) {
        result.push({
            offsetX:0,
            offsetY:length,
            uniqueLevelObjectId: lo.uuid,
            layer: trueLayer,
            renderData: bottom
        });
    }
    // In-between
    if (length > 1) {
        for (let i = 1; i < length; i++) {
            result.push({
                offsetX:0,
                offsetY:i,
                uniqueLevelObjectId: lo.uuid,
                layer: trueLayer,
                renderData: middle
            });
        }
    }

    return result
}

export function drawHorizontalItemWithEnds(lo: LevelObject, left: RenderData, middle: RenderData, right: RenderData, layer?: LayerOrder): DrawInstruction[] {
    let result: DrawInstruction[] = [];
    if (lo.dimZ === undefined) {
        console.error("No DimZ:",lo);
        return result;
    }
    // Length of zero means only source
    const length = lo.dimZ;
    const trueLayer = layer ? layer : LayerOrder.STANDARD_OBJECTS;

    // Do source
    result.push({
        offsetX:0,
        offsetY: 0,
        uniqueLevelObjectId: lo.uuid,
        layer: trueLayer,
        renderData: left
    });
    // Do end if greater than 0
    if (length > 0) {
        result.push({
            offsetX:length,
            offsetY:0,
            uniqueLevelObjectId: lo.uuid,
            layer: trueLayer,
            renderData: right
        });
    }
    // Do betweens if more than 2 tiles
    if (length > 1) {
        for (let i = 1; i < length; i++) {
            result.push({
                offsetX:i,
                offsetY:0,
                uniqueLevelObjectId: lo.uuid,
                layer: trueLayer,
                renderData: middle
            });
        }
    }
    return result;
}