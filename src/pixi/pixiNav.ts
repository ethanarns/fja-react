import { Application } from "pixi.js";
import { FULL_TILE_DIMS_PX } from "../GLOBALS";

export const ARROW_MOVE_SPEED = FULL_TILE_DIMS_PX;

export function zoom(pixiApp: Application, dir: "in" | "out" | "reset"): void {
    if (dir === "in") {
        pixiApp.stage.scale.x += 0.1;
        pixiApp.stage.scale.y += 0.1;
    } else if (dir === "out"){
        pixiApp.stage.scale.x -= 0.1;
        pixiApp.stage.scale.y -= 0.1;
    } else {
        pixiApp.stage.scale.x = 1;
        pixiApp.stage.scale.y = 1;
    }
}

export function pan(pixiApp: Application, dir: "up" | "down" | "left" | "right"): void {
    switch(dir) {
        case "up":
            pixiApp.stage.y += ARROW_MOVE_SPEED;
            break;
        case "down":
            pixiApp.stage.y -= ARROW_MOVE_SPEED;
            break;
        case "left":
            pixiApp.stage.x += ARROW_MOVE_SPEED;
            break;
        case "right":
            pixiApp.stage.x -= ARROW_MOVE_SPEED;
            break;
        default:
            console.error("Unknown direction:", dir);
            break;
    }
}