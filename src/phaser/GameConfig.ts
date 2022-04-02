import Phaser from "phaser";
import "../GLOBALS";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PHASER_CANVAS_ID } from "../GLOBALS";
import RenderScene from "./RenderScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: '#555555',
    parent: PHASER_CANVAS_ID,
    dom: {
        createContainer: false
    },
    pixelArt: true,
    scene: RenderScene
};