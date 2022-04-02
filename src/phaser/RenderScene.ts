import Phaser from "phaser";

import { SCENE_ID } from "../GLOBALS";

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

    addObject() {
        this.add.circle(this.temp,10,5,0xff0000,1);
        this.temp += 10;
    }
}