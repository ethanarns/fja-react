import { DisplayObject, Container } from "pixi.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, FULL_TILE_DIMS_PX } from "../GLOBALS";

export const ARROW_MOVE_SPEED = FULL_TILE_DIMS_PX;

export function zoom(navObject: Container, dir: "in" | "out" | "reset"): void {
    if (dir === "in") {
        navObject.scale.x *= 1.1;
        navObject.scale.y *= 1.1;
    } else if (dir === "out"){
        navObject.scale.x *= 0.9;
        navObject.scale.y *= 0.9;
    } else {
        navObject.scale.x = 1;
        navObject.scale.y = 1;
    }
}

export function pan(navObject: Container, dir: "up" | "down" | "left" | "right"): void {
    switch(dir) {
        case "up":
            navObject.pivot.y -= ARROW_MOVE_SPEED;
            break;
        case "down":
            navObject.pivot.y += ARROW_MOVE_SPEED;
            break;
        case "left":
            navObject.pivot.x -= ARROW_MOVE_SPEED;
            break;
        case "right":
            navObject.pivot.x += ARROW_MOVE_SPEED;
            break;
        default:
            console.error("Unknown direction:", dir);
            break;
    }
}

export function zeroNavObject(navObject: DisplayObject) {
    navObject.pivot.set(-1 * (CANVAS_WIDTH / 2), -1 * (CANVAS_HEIGHT / 2));
    navObject.x = (CANVAS_WIDTH / 2);
    navObject.y = (CANVAS_HEIGHT / 2);
    navObject.pivot.set((CANVAS_WIDTH / 2),(CANVAS_HEIGHT / 2));
}