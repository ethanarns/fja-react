/**
 * This file contains most of the starting logic, but is mainly used for initializing
 * the entire app upon loading of the ROM file. Its only functions should be those
 * related to interacting with the HTML, other functions should be created in
 * different files
 */

import './App.css';
import { ARROW_MOVE_SPEED, DOM_CANVAS_ID, TILEMAP_ID } from './GLOBALS';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { RomContext } from './rom-mod/RomProvider';
import generatePixiApp from './pixi/getPixiApp';
import { Application, RenderTexture } from "pixi.js"
import { CompositeTilemap } from "@pixi/tilemap";
import { getDefaultRenderTextures } from './rom-mod/tile-rendering/texture-generation';
import { RomData } from './rom-mod/RomInterfaces';
import { fullRender, placeLevelObject, wipeTiles } from "./pixi/pixiMod";
import ScreenPageData from "./rom-mod/tile-rendering/ScreenPageChunks";
import { } from './rom-mod/tile-rendering/drawInstructionRetrieval/commonInstructions';

function App() {
    const [pixiApp, setPixiApp] = useState<Application | null>(null);
    const [inputLoaded, setInputLoaded] = useState(false);
    const [textureCache, setTextureCache] = useState<Record<string,RenderTexture>>({});
    const [screenPageData, setScreenPageData] = useState<ScreenPageData[]>([]);
    const [romData, setRomData] = useState<RomData>();
    const [curLevelId, setCurLevelId] = useState(0);
    const [loading, setLoading] = useState(false);

    const { loadRomFromArrayBuffer } = useContext(RomContext);

    // Basically on load
    useEffect(() => {
        const newPixiApp = generatePixiApp();
        setPixiApp(newPixiApp);
        setCurLevelId(0);
        if (newPixiApp === null) {
            console.log("PixiApp failed to initialize for graphics generation");
            return;
        }
        setTextureCache(getDefaultRenderTextures(newPixiApp));
    },[]);

    const rerenderPages = () => {
        setLoading(true);
        // Allow popup time to render
        window.setTimeout(() => {
            const start = performance.now();
            if (!pixiApp) {
                console.error("PixiJS App not started");
                return;
            }
            if (!romData) {
                console.error("romData not retrieved");
                return;
            }
            wipeTiles(pixiApp);
            fullRender(romData.levels[curLevelId],pixiApp,textureCache,setTextureCache,screenPageData);
            console.log("rerenderPages exec time in ms:", performance.now() - start);
            setLoading(false);
        },1);
    };

    // Sprite callback
    (window as any).spriteClicked = (uuid: string) => {
        const foundObjects = romData!.levels[curLevelId].objects.filter(o => o.uuid === uuid);
        if (foundObjects.length === 1) {
            console.log(foundObjects[0]);
        } else {
            console.warn("Unusual number of objects found:", foundObjects);
        }
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
        setLoading(true);
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

            loadedGameData.levels[curLevelId].objects.forEach(lobj => {
                placeLevelObject(lobj, loadedGameData.levels[curLevelId], screenPages, new Uint8Array(result));
            });

            // Can't do local rerender, parent objects not yet set
            fullRender(loadedGameData.levels[curLevelId],pixiApp,textureCache,setTextureCache,screenPages);

            // Set up key controls
            document.addEventListener("keydown", (ev: KeyboardEvent) => {
                if (!pixiApp) {
                    return;
                }
                switch (ev.key) {
                    case "ArrowDown":
                        pixiApp.stage.y -= ARROW_MOVE_SPEED;
                        break;
                    case "ArrowUp":
                        pixiApp.stage.y += ARROW_MOVE_SPEED;
                        break;
                    case "ArrowRight":
                        pixiApp.stage.x -= ARROW_MOVE_SPEED;
                        break;
                    case "ArrowLeft":
                        pixiApp.stage.x += ARROW_MOVE_SPEED;
                        break;
                    case "[":
                        pixiApp.stage.scale.x += 0.1;
                        pixiApp.stage.scale.y += 0.1;
                        break;
                    case "]":
                        pixiApp.stage.scale.x -= 0.1;
                        pixiApp.stage.scale.y -= 0.1;
                        break;
                    case "0":
                        pixiApp.stage.scale.x = 1;
                        pixiApp.stage.scale.y = 1;
                        break;
                    default:
                        break;
                };
            });
            setLoading(false);
        }).catch((err: any) => {
            console.error("Error caught when trying to load ROM:");
            console.error(err);
        });
    }
    
    return (
        <div className="App">
            <div id={DOM_CANVAS_ID}>
                <div style={{
                    position: "absolute",
                    top: 260,
                    left: 300,
                    fontSize: 40,
                    display: loading ? "block" : "none"
                }}>Loading...</div>
            </div>
            <section id="buttons">
                <button onClick={rerenderPages} disabled={loading || !inputLoaded}>Re-render</button>
                { inputLoaded === false ? <input type="file" onInput={fileOpened} disabled={loading}/> : null }
            </section>
        </div>
    );
}

export default App;
