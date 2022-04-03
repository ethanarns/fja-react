import { Graphics, Application } from "pixi.js";

export function placeGraphic(graphic: Graphics, x: number, y: number, pixiApp: Application, chunkCode: string): Graphics {
    graphic.x = x;
    graphic.y = y;
    graphic.interactive = true;
    graphic.buttonMode = true;
    graphic.name = chunkCode;
    graphic.on('pointerdown', () => {
        console.log(chunkCode,x,y);
    });
    pixiApp.stage.addChild(graphic);
    return graphic;
}