import { Application, settings, SCALE_MODES } from "pixi.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, DOM_CANVAS_ID } from "../GLOBALS";

export default function generatePixiApp(): Application | null {
    const pixiApp = new Application({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        antialias: false
    });
    settings.SCALE_MODE = SCALE_MODES.NEAREST;
    const foundCanvas = document.getElementById(DOM_CANVAS_ID);
    if (!foundCanvas) {
        console.error("COULD NOT FIND CANVAS ", DOM_CANVAS_ID);
        return pixiApp;
    }
    foundCanvas.append(pixiApp.view);
    return pixiApp;
}
