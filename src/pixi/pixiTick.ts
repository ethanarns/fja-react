import { Application } from "pixi.js";

let tickFrame = 0;
const BLINK_RATE = 20;
export function tick(pixiApp: Application, delta: number): void {
    tickFrame++;
    // x = 0; y = 1
    pixiApp.renderer.plugins.tilemap.tileAnim[0] = Math.floor(tickFrame/BLINK_RATE);
}