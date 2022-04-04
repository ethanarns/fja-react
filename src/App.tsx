import './App.css';
import { DOM_CANVAS_ID } from './GLOBALS';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { RomContext } from './rom-mod/RomProvider';
import generatePixiApp from './pixi/getPixiApp';
import { Application, RenderTexture } from "pixi.js"
import { CompositeTilemap } from "@pixi/tilemap";
import { generateGraphics } from './rom-mod/tile-rendering/tile-render-main';
import { placeLevelObject } from "./pixi/pixiMod";
import { Level } from './rom-mod/RomInterfaces';

function App() {
    const [pixiApp, setPixiApp] = useState<Application | null>(null);
    const [inputLoaded, setInputLoaded] = useState(false);
    const [availableGraphics, setAvailableGraphics] = useState<Record<string,RenderTexture>>({});

    const { loadRomFromArrayBuffer } = useContext(RomContext);

    // Basically on load
    useEffect(() => {
        const newPixiApp = generatePixiApp();
        setPixiApp(newPixiApp);
    },[]);

    /**
     * Wipes all renders and Graphics, then regenerates the graphics
     * Record object
     * @param l Level
     * @returns Record<string,Graphics>
     */
    const updateGraphicsForLevel = (l: Level) => {
        // Clean the stage
        if (!pixiApp) {
            console.error("Cannot wipe stage, app not started");
            return {};
        }
        pixiApp.stage.children.forEach(c => {
            c.destroy();
        });
        pixiApp.stage.removeChildren();

        // Then, wipe the existing graphics available
        const existingGraphicsKeys = Object.keys(availableGraphics);
        existingGraphicsKeys.forEach(key => {
            availableGraphics[key].destroy();
        })
        setAvailableGraphics({});

        // Then create the new ones
        const graphics = generateGraphics(l,pixiApp);
        setAvailableGraphics(graphics);
        return graphics;
    };

    const fileOpened = (event: FormEvent<HTMLInputElement>) => {
        if (!pixiApp) {
            console.error("PIXI App not loaded when file opened");
            return;
        }
        const target = event.target as HTMLInputElement;
        if (!target || !target.files) {
            console.error("Could not target loader element");
            return;
        } if (target.files.length !== 1) {
            console.error(`Incorrect number of files uploaded: ${target.files.length}`);
            return;
        }
        const file: File = target.files[0];
        file.arrayBuffer().then(result => {
            const loadedGameData = loadRomFromArrayBuffer(result);
            setInputLoaded(true);
            console.log("loadedGameData",loadedGameData);
            const tmpGraphics = updateGraphicsForLevel(loadedGameData.levels[0]);
            const tilemap = new CompositeTilemap();
            tilemap.name = "base_tilemap";
            console.log("t",tilemap);
            pixiApp.stage.addChild(tilemap);
            // tilemap.tile(tmpGraphics["108d"],0,0);
            // tilemap.tile(tmpGraphics["108d"],8,8);

            const obj63 = loadedGameData.levels[0].objects.filter(o => o.objectId === 0x63)[0];
            console.log("obj63",obj63);
            obj63.xPos = 0;
            obj63.yPos = 0;
            obj63.dimZ = 1;
            placeLevelObject(obj63, loadedGameData.levels[0], pixiApp, tmpGraphics);
            const obj63_2 = loadedGameData.levels[0].objects.filter(o => o.objectId === 0x63)[1];
            console.log("obj63_2",obj63_2);
            obj63_2.xPos = 1;
            obj63_2.yPos = 1;
            obj63_2.dimZ = 2;
            placeLevelObject(obj63_2, loadedGameData.levels[0], pixiApp, tmpGraphics);
            // pixiApp.loader
            // let i = 0;
            // loadedGameData.levels[0].objects.forEach((lo: LevelObject, index: number) => {
            //     if (lo.objectId === 0x63) {
            //         lo.xPos = i;
            //         lo.yPos = i;
            //         i++;
            //         placeLevelObject(lo, loadedGameData.levels[0], pixiApp, tmpGraphics);
            //     }
            // });

            // //const graphics = generateGraphics(loadedGameData.levels[0]);
            // getAllChunkCodes().forEach((code: string, index: number) => {
            //     const x = index % 10;
            //     const y = Math.floor(index / 10);
            //     placeGraphic(tmpGraphics[code],x*10,y*10,pixiApp, code, () => {
            //         pixiApp.stage.scale.x *= 0.9;
            //         pixiApp.stage.scale.y *= 0.9;
            //     });
            // });

            // const g2 = updateGraphicsForLevel(loadedGameData.levels[1]);
            // console.log(g2);

            // //const graphics = generateGraphics(loadedGameData.levels[0]);
            // getAllChunkCodes().forEach((code: string, index: number) => {
            //     const x = (index % 10);
            //     const y = Math.floor(index / 10);
            //     placeGraphic(g2[code],x*10 + 120,y*10,pixiApp, code, (graphic: Graphics, x: number, y: number, chunkCode: string) => {
            //         pixiApp.stage.scale.x *= 1.1;
            //         pixiApp.stage.scale.y *= 1.1;
            //         pixiApp.stage.x += 10;
            //         graphic.destroy();
            //     });
            // });
        }).catch((err: any) => {
            console.error("Error caught when trying to load ROM:");
            console.error(err);
        });
    }
    
    return (
        <div className="App">
            <div id={DOM_CANVAS_ID}></div>
            { inputLoaded === false ? <input type="file" onInput={fileOpened}/> : null }
        </div>
    );
}

export default App;
