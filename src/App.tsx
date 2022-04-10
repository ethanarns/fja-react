/**
 * This file contains most of the starting logic, but is mainly used for initializing
 * the entire app upon loading of the ROM file. Its only functions should be those
 * related to interacting with the HTML, other functions should be created in
 * different files
 */

import './App.css';
import { DOM_CANVAS_ID, FULL_TILE_DIMS_PX, FULL_TILE_DIM_COUNT, WHITE_SQUARE_RENDER_CODE } from './GLOBALS';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { RomContext } from './rom-mod/RomProvider';
import generatePixiApp from './pixi/getPixiApp';
import { Application, RenderTexture, Sprite } from "pixi.js"
import { } from "@pixi/tilemap";
import { getDefaultRenderTextures } from './rom-mod/tile-rendering/texture-generation';
import { RomData } from './rom-mod/RomInterfaces';
import { placeLevelObject, renderScreen, wipeTiles } from "./pixi/pixiMod";
import { pan, zoom } from "./pixi/pixiNav";
import ScreenPageData from "./rom-mod/tile-rendering/ScreenPageChunks";
import { } from './rom-mod/tile-rendering/drawInstructionRetrieval/commonInstructions';
import { getLevelByOffsetId } from './rom-mod/RomParser';

function App() {
    const [pixiApp, setPixiApp] = useState<Application | null>(null);
    const [inputLoaded, setInputLoaded] = useState(false);
    const [textureCache, setTextureCache] = useState<Record<string,RenderTexture>>({});
    const [screenPageData, setScreenPageData] = useState<ScreenPageData[]>([]);
    const [romData, setRomData] = useState<RomData>();
    const [curLevelId, setCurLevelId] = useState(0);
    const [loading, setLoading] = useState(false);

    const { loadRomFromArrayBuffer, romBuffer } = useContext(RomContext);

    // Basically on load
    useEffect(() => {
        const newPixiApp = generatePixiApp();
        setPixiApp(newPixiApp);
        setCurLevelId(0x0);
        if (newPixiApp === null) {
            console.log("PixiApp failed to initialize for graphics generation");
            return;
        }
        setTextureCache(getDefaultRenderTextures(newPixiApp));
    },[]);

    const reapplyPagesObjects = () => {
        const reapplyPagesPerf = performance.now();
        if (!romData) {
            console.error("romData not retrieved");
            return;
        }
        screenPageData.forEach(sp => {
            sp.wipeChunks();
        });
        const levelRef = getLevelByOffsetId(romData.levels,curLevelId);
        if (!levelRef) {
            return;
        }
        levelRef.objects.forEach(lobj => {
            placeLevelObject(lobj, levelRef, screenPageData, romBuffer);
        });
        console.log(`reapplyPagesObjects completed in ${performance.now() - reapplyPagesPerf} ms`);
    }

    const rerenderPages = () => {
        const rerenderPerf = performance.now();
        setLoading(true);
        // Allow popup time to render
        window.setTimeout(() => {
            if (!pixiApp) {
                console.error("PixiJS App not started");
                return;
            }
            if (!romData) {
                console.error("romData not retrieved");
                return;
            }
            const levelRef = getLevelByOffsetId(romData.levels,curLevelId);
            if (!levelRef) {
                return;
            }
            reapplyPagesObjects();
            wipeTiles(screenPageData);
            screenPageData.forEach(sp => {
                renderScreen(levelRef,pixiApp,textureCache,setTextureCache,sp);
            })
            setLoading(false);
            console.log(`rerenderPages completed in ${performance.now() - rerenderPerf} ms`);
        },1);
    };

    /**
     * Hack to fix annoying issue where this doesn't have access to member data normally
     */
    (window as any).spriteClicked = (e: any) => {
        if (!pixiApp) {
            console.error("No pixiApp!");
            return;
        }
        if (!romData) {
            console.error("No romData!");
            return;
        }
        const levelRef = getLevelByOffsetId(romData.levels,curLevelId);
        if (!levelRef) {
            return;
        }
        if (!e || !e.data || !e.data.global) {
            console.error("Bad event input:", e);
            return;
        }
        const dims = e.data.global;
        let trueXpx = dims.x - pixiApp.stage.x;
        let trueYpx = dims.y - pixiApp.stage.y;
        const tileX = Math.floor(trueXpx / FULL_TILE_DIMS_PX);
        const tileY = Math.floor(trueYpx / FULL_TILE_DIMS_PX);
        const spid = ScreenPageData.getScreenPageIdFromTileCoords(tileX,tileY);
        const foundScreenPages = screenPageData.filter(sp => sp.screenPageId === spid);
        if (foundScreenPages.length === 1) {
            const sp = foundScreenPages[0];
            trueXpx -= sp.globalPixelX;
            trueYpx -= sp.globalPixelY;
            const found = sp.getTileChunkDataFromLocalCoords(
                Math.floor(trueXpx / 8),
                Math.floor(trueYpx / 8)
            );
            if (!found) {
                return;
            }
            const uuids = found.map(x => x.objUuidFrom);
            console.log(uuids);
        } else {
            console.error("Unusual number of screen pages found:", foundScreenPages);
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

            // Create the ScreenPages
            const screenPages = ScreenPageData.generateAllScreenPages(pixiApp);
            setScreenPageData(screenPages);

            const tempLoadedUint8Array = new Uint8Array(result);
            const levelRef = getLevelByOffsetId(loadedGameData.levels,curLevelId);
            if (!levelRef) {
                return;
            }
            levelRef.objects.forEach(lobj => {
                placeLevelObject(lobj, levelRef, screenPages, tempLoadedUint8Array);
            });

            // Can't do local rerender, parent objects not yet set
            screenPages.forEach(sp => {
                renderScreen(levelRef,pixiApp,textureCache,setTextureCache,sp);
            });

            // Add interactive overlay
            const interactiveSprite = Sprite.from(textureCache[WHITE_SQUARE_RENDER_CODE]);
            interactiveSprite.interactive = true;
            interactiveSprite.alpha = 0;
            interactiveSprite.x = 0;
            interactiveSprite.y = 0;
            interactiveSprite.width = FULL_TILE_DIM_COUNT * FULL_TILE_DIMS_PX;
            interactiveSprite.height = FULL_TILE_DIM_COUNT * FULL_TILE_DIMS_PX;
            interactiveSprite.on("pointerdown", (event: any) => {
                // Fixes annoying issue where it doesn't have access to any data
                (window as any).spriteClicked(event);
            });
            pixiApp.stage.addChild(interactiveSprite);

            // Set up key controls
            document.addEventListener("keydown", (ev: KeyboardEvent) => {
                if (!pixiApp) {
                    return;
                }
                switch (ev.key) {
                    case "ArrowDown":
                        pan(pixiApp,"down");
                        break;
                    case "ArrowUp":
                        pan(pixiApp,"up");
                        break;
                    case "ArrowRight":
                        pan(pixiApp,"right");
                        break;
                    case "ArrowLeft":
                        pan(pixiApp,"left");
                        break;
                    case "]":
                    case "=": // Is there + is, so they don't need to press shift
                    case "+":
                        zoom(pixiApp,"in");
                        break;
                    case "-":
                    case "[":
                        zoom(pixiApp, "out");
                        break;
                    case "0":
                        zoom(pixiApp, "reset");
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
