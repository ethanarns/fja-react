import Phaser from "phaser";
import { SCENE_ID } from "../GLOBALS";
import { Level } from "../rom-mod/RomInterfaces";
import { generateTilesheet } from "../rom-mod/tile-rendering/tile-render-main";

export default class RenderScene extends Phaser.Scene {
    temp: number = 10;

    constructor() {
        super(SCENE_ID);
    }
    preload() {

    }
    
    create() {

    }
    
    update() {

    }

    updateRomData(level: Level): void {
        const ROW_WIDTH = 10;
        const codes = generateTilesheet(this.textures, level);
        for (let i = 0; i < codes.length; i++) {
            const y = Math.floor(i/ROW_WIDTH);
            const x = i % ROW_WIDTH;
            this.add.image(x*10,y*10,codes[i]);
        }
    }
}