import './App.css';
import { DOM_CANVAS_ID, TILEMAP_ID } from './GLOBALS';
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
        const tilemap = pixiApp.stage.getChildByName(TILEMAP_ID) as CompositeTilemap;
        tilemap.clear();

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
            // Load the ROM data
            const loadedGameData = loadRomFromArrayBuffer(result);
            setInputLoaded(true);
            console.log("loadedGameData",loadedGameData);
            // Create the tilemap
            const tilemap = new CompositeTilemap();
            tilemap.name = TILEMAP_ID;
            pixiApp.stage.addChild(tilemap);
            // First graphics update
            const tmpGraphics = updateGraphicsForLevel(loadedGameData.levels[0]);

            // Object placement testing
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
