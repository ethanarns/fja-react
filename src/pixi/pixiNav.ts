import { DisplayObject, Container, Application } from "pixi.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, FULL_TILE_DIMS_PX, NAV_CONTAINER } from "../GLOBALS";
import { LevelObject } from "../rom-mod/RomInterfaces";

export const ARROW_MOVE_SPEED = FULL_TILE_DIMS_PX;
export const MAX_ZOOM_VALUE = 3;

export let global_zoom = 1;

export function zoom(navObject: Container, dir: "in" | "out" | "reset"): void {
    if (dir === "in") {
        global_zoom *= 1.1;
        if (global_zoom > MAX_ZOOM_VALUE) {
            global_zoom = MAX_ZOOM_VALUE;
        }
        navObject.scale.x = global_zoom;
        navObject.scale.y = global_zoom;
    } else if (dir === "out"){
        global_zoom *= 0.9;
        if (global_zoom < 0) {
            global_zoom = 0;
        }
        navObject.scale.x = global_zoom;
        navObject.scale.y = global_zoom;
    } else {
        global_zoom = 1;
        navObject.scale.x = global_zoom;
        navObject.scale.y = global_zoom;
    }
    clampNav(navObject);
}

export function pan(navObject: Container, dir: "up" | "down" | "left" | "right"): void {
    const scale = global_zoom;
    switch(dir) {
        case "up":
            navObject.pivot.y -= ARROW_MOVE_SPEED / scale;
            break;
        case "down":
            navObject.pivot.y += ARROW_MOVE_SPEED / scale;
            break;
        case "left":
            navObject.pivot.x -= ARROW_MOVE_SPEED / scale;
            break;
        case "right":
            navObject.pivot.x += ARROW_MOVE_SPEED / scale;
            break;
        default:
            console.error("Unknown direction:", dir);
            break;
    }
    clampNav(navObject);
}

export function getTranslatedCoords(navObject: DisplayObject): {x: number, y: number} {
    let ret = {
        x: -99999,
        y: -99999
    };

    const scaleVal = global_zoom;
    ret.x = navObject.pivot.x - (CANVAS_WIDTH / scaleVal / 2);
    ret.y = navObject.pivot.y - (CANVAS_HEIGHT / scaleVal / 2);

    return ret;
}

export function localDimsToGlobalX(pixiApp: Application, localPixelX: number, localPixelY: number): {x: number, y: number} {
    const nav = pixiApp.stage.getChildByName(NAV_CONTAINER);
    const navCoords = getTranslatedCoords(nav);
    let trueXpx = localPixelX / global_zoom + navCoords.x;
    let trueYpx = localPixelY / global_zoom + navCoords.y;
    return {
        x: trueXpx,
        y: trueYpx
    };
}

function clampNav(navObject: DisplayObject): void {
    const newCoords = getTranslatedCoords(navObject);
    const scaleVal = global_zoom;
    if (newCoords.x < 0) {
        navObject.pivot.x = 0 + (CANVAS_WIDTH / scaleVal / 2);
    }
    if (newCoords.y < 0) {
        navObject.pivot.y = 0 + (CANVAS_HEIGHT / scaleVal / 2);
    }

    if (newCoords.x + CANVAS_WIDTH / scaleVal > (0xff*16 + 16)) {
        navObject.pivot.x = (0xff*16 + 16) - (CANVAS_WIDTH / scaleVal / 2);
    }
    if (newCoords.y + CANVAS_HEIGHT / scaleVal > (0xff*16 / 2)) {
        navObject.pivot.y = (0xff*16 / 2) - (CANVAS_HEIGHT / scaleVal / 2);
    }
}

export function zeroNavObject(navObject: DisplayObject) {
    navObject.pivot.set(-1 * (CANVAS_WIDTH / 2), -1 * (CANVAS_HEIGHT / 2));
    navObject.x = (CANVAS_WIDTH / 2);
    navObject.y = (CANVAS_HEIGHT / 2);
    navObject.pivot.set((CANVAS_WIDTH / 2),(CANVAS_HEIGHT / 2));
}

let isDragging = false;
let dragStartX = -1;
let dragStartY = -1;
let objectDragStartX = -1;
let objectDragStartY = -1;

/**
 * Deals
 * @param pixiApp Application
 * @param dims object with x and y coords that are local
 * @param curSelectedObject LevelObject, may be null
 * @returns true if object was moved, false if not
 */
export function handleDragMove(pixiApp: Application, dims: any, curSelectedObject: LevelObject | null): boolean {
    if (isDragging && curSelectedObject !== null) {
        const globalDims = localDimsToGlobalX(pixiApp,dims.x,dims.y);
        const offsetX = globalDims.x - dragStartX;
        const offsetY = globalDims.y - dragStartY;
        const tileOffsetX = Math.floor(offsetX / FULL_TILE_DIMS_PX);
        const tileOffsetY = Math.floor(offsetY / FULL_TILE_DIMS_PX);
        curSelectedObject.xPos = tileOffsetX + objectDragStartX;
        curSelectedObject.yPos = tileOffsetY + objectDragStartY;
        console.log(
            curSelectedObject.objectId.toString(16),
            curSelectedObject.xPos.toString(16),
            curSelectedObject.yPos.toString(16)
        );
        return true;
    }
    return false;
}

export function handlePointerDown(pixiApp: Application, dims: any, curSelectedObject: LevelObject | null) {
    if (curSelectedObject === null) {
        return;
    }
    isDragging = true;

    const globalDims = localDimsToGlobalX(pixiApp,dims.x,dims.y);
    dragStartX = globalDims.x;
    dragStartY = globalDims.y;
    objectDragStartX = curSelectedObject.xPos + 0;
    objectDragStartY = curSelectedObject.yPos + 0;
}

export function handlePointerUp(pixiApp: Application) {
    isDragging = false;
}