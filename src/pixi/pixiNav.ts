import { DisplayObject, Container } from "pixi.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, FULL_TILE_DIMS_PX } from "../GLOBALS";

export const ARROW_MOVE_SPEED = FULL_TILE_DIMS_PX;

let global_zoom = 1;

export function zoom(navObject: Container, dir: "in" | "out" | "reset"): void {
    if (dir === "in") {
        global_zoom *= 1.1;
        if (global_zoom > 3) {
            global_zoom = 3;
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

function getTranslatedCoords(navObject: DisplayObject): {x: number, y: number} {
    let ret = {
        x: -99999,
        y: -99999
    };

    const scaleVal = global_zoom;
    ret.x = navObject.pivot.x - (CANVAS_WIDTH / scaleVal / 2);
    ret.y = navObject.pivot.y - (CANVAS_HEIGHT / scaleVal / 2);

    return ret;
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

    if (newCoords.x + CANVAS_WIDTH / scaleVal > 0xff*16) {
        navObject.pivot.x = 0xff*16 - (CANVAS_WIDTH / scaleVal / 2);
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