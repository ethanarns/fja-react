import { Application, settings, SCALE_MODES } from "pixi.js";
import { BG_COLOR, CANVAS_HEIGHT, CANVAS_WIDTH, DOM_CANVAS_ID } from "../GLOBALS";
import { settings as tsettings } from "@pixi/tilemap";

export default function generatePixiApp(): Application | null {
    console.log("Starting PixiJS Application");
    // No longer needed due to pre-render overlap removal
    // tsettings.TEXTURES_PER_TILEMAP = 120;
    const pixiApp = new Application({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        antialias: false,
        backgroundColor: BG_COLOR
    });
    settings.SCALE_MODE = SCALE_MODES.NEAREST;
    const foundCanvas = document.getElementById(DOM_CANVAS_ID);
    if (!foundCanvas) {
        console.error("COULD NOT FIND CANVAS ", DOM_CANVAS_ID);
        return null;
    }
    foundCanvas.append(pixiApp.view);
    return pixiApp;
}
