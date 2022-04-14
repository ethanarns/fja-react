import { DisplayObject, Container } from "pixi.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, FULL_TILE_DIMS_PX } from "../GLOBALS";

export const ARROW_MOVE_SPEED = FULL_TILE_DIMS_PX;

export const ZOOM_SCALE: Record<number,number> = {
    0: 0.5,
    1: 1.0,
    2: 1.5,
    3: 2.0
};
export const MAX_ZOOM_KEY = 3;

let zoom_global_key = 1;

export function zoom(navObject: Container, dir: "in" | "out" | "reset"): void {
    if (dir === "in") {
        zoom_global_key++;
        if (zoom_global_key > MAX_ZOOM_KEY) {
            zoom_global_key = MAX_ZOOM_KEY;
        }
        navObject.scale.x = ZOOM_SCALE[zoom_global_key];
        navObject.scale.y = ZOOM_SCALE[zoom_global_key];
    } else if (dir === "out"){
        zoom_global_key--;
        if (zoom_global_key < 0) {
            zoom_global_key = 0;
        }
        navObject.scale.x = ZOOM_SCALE[zoom_global_key];
        navObject.scale.y = ZOOM_SCALE[zoom_global_key];
    } else {
        zoom_global_key = 1;
        navObject.scale.x = ZOOM_SCALE[zoom_global_key];
        navObject.scale.y = ZOOM_SCALE[zoom_global_key];
    }
    clampNav(navObject);
}

export function pan(navObject: Container, dir: "up" | "down" | "left" | "right"): void {
    const scale = ZOOM_SCALE[zoom_global_key];
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

function getTranslatedCoords(navObject: DisplayObject): {x: number, y: number} {
    let ret = {
        x: -99999,
        y: -99999
    };

    const scaleVal = ZOOM_SCALE[zoom_global_key];
    ret.x = navObject.pivot.x - (CANVAS_WIDTH / scaleVal / 2);
    ret.y = navObject.pivot.y - (CANVAS_HEIGHT / scaleVal / 2);

    return ret;
}

function clampNav(navObject: DisplayObject): void {
    const newCoords = getTranslatedCoords(navObject);
    const scaleVal = ZOOM_SCALE[zoom_global_key];
    if (newCoords.x < 0) {
        navObject.pivot.x = 0 + (CANVAS_WIDTH / scaleVal / 2);
    }
    if (newCoords.y < 0) {
        navObject.pivot.y = 0 + (CANVAS_HEIGHT / scaleVal / 2);
    }
}

export function zeroNavObject(navObject: DisplayObject) {
    navObject.pivot.set(-1 * (CANVAS_WIDTH / 2), -1 * (CANVAS_HEIGHT / 2));
    navObject.x = (CANVAS_WIDTH / 2);
    navObject.y = (CANVAS_HEIGHT / 2);
    navObject.pivot.set((CANVAS_WIDTH / 2),(CANVAS_HEIGHT / 2));
}