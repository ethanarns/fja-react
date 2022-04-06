/**
 * This file contains most of the starting logic, but is mainly used for initializing
 * the entire app upon loading of the ROM file. Its only functions should be those
 * related to interacting with the HTML, other functions should be created in
 * different files
 */

import './App.css';
import { DOM_CANVAS_ID, TILEMAP_ID } from './GLOBALS';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { RomContext } from './rom-mod/RomProvider';
import generatePixiApp from './pixi/getPixiApp';
import { Application, RenderTexture } from "pixi.js"
import { CompositeTilemap } from "@pixi/tilemap";
import { } from './rom-mod/tile-rendering/texture-generation';
import { RomData } from './rom-mod/RomInterfaces';
import { fullRender, placeLevelObject, wipeTiles } from "./pixi/pixiMod";
import ScreenPageData from "./rom-mod/tile-rendering/ScreenPageChunks";

function App() {
    const [pixiApp, setPixiApp] = useState<Application | null>(null);
    const [inputLoaded, setInputLoaded] = useState(false);
    const [textureCache, setTextureCache] = useState<Record<string,RenderTexture>>({});
    const [screenPageData, setScreenPageData] = useState<ScreenPageData[]>([]);
    const [romData, setRomData] = useState<RomData>();
    const [curLevelId, setCurLevelId] = useState(0);

    const { loadRomFromArrayBuffer } = useContext(RomContext);

    // Basically on load
    useEffect(() => {
        const newPixiApp = generatePixiApp();
        setPixiApp(newPixiApp);
        setCurLevelId(0);
    },[]);

    const rerenderPages = () => {
        if (!pixiApp) {
            console.error("PixiJS App not started");
            return;
        }
        if (!romData) {
            console.error("romData not retrieved");
            return;
        }
        wipeTiles(pixiApp);
        fullRender(romData.levels[curLevelId],pixiApp,textureCache,setTextureCache,screenPageData)
    }

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
            setRomData(loadedGameData);

            // Create the tilemap
            const tilemap = new CompositeTilemap();
            tilemap.name = TILEMAP_ID;
            pixiApp.stage.addChild(tilemap);

            // Create the ScreenPages
            const screenPages = ScreenPageData.generateAllScreenPages()
            setScreenPageData(screenPages);

            const obj63 = loadedGameData.levels[0].objects.filter(o => o.objectId === 0x63)[0];
            console.log("obj63",obj63);
            obj63.xPos = 5;
            obj63.yPos = 2;
            placeLevelObject(obj63, loadedGameData.levels[0], screenPages);
            const obj63_2 = loadedGameData.levels[0].objects.filter(o => o.objectId === 0x63)[1];
            console.log("obj63_2",obj63_2);
            obj63_2.xPos = 14;
            obj63_2.yPos = 1;
            obj63_2.dimZ = 5;
            placeLevelObject(obj63_2, loadedGameData.levels[0], screenPages);

            // Can't do local rerender, parent objects not yet set
            fullRender(loadedGameData.levels[curLevelId],pixiApp,textureCache,setTextureCache,screenPages);

        }).catch((err: any) => {
            console.error("Error caught when trying to load ROM:");
            console.error(err);
        });
    }
    
    return (
        <div className="App">
            <div id={DOM_CANVAS_ID}></div>
            <section id="buttons">
                <button onClick={rerenderPages}>Re-render</button>
                { inputLoaded === false ? <input type="file" onInput={fileOpened}/> : null }
            </section>
        </div>
    );
}

export default App;
