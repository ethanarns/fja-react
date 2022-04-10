import { Application } from "pixi.js";

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