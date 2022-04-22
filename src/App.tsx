/**
 * This file contains most of the starting logic, but is mainly used for initializing
 * the entire app upon loading of the ROM file. Its only functions should be those
 * related to interacting with the HTML, other functions should be created in
 * different files
 */

import './App.css';
import { DOM_CANVAS_ID, FULL_TILE_DIMS_PX, FULL_TILE_DIM_COUNT, MAX_LEVEL_ENTRANCE_ID, NAV_CONTAINER, WHITE_SQUARE_RENDER_CODE } from './GLOBALS';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { RomContext } from './rom-mod/RomProvider';
import generatePixiApp from './pixi/getPixiApp';
import { Application, Container, RenderTexture, Sprite } from "pixi.js"
import { getDefaultRenderTextures } from './rom-mod/tile-rendering/texture-generation';
import { LevelObject, RomData } from './rom-mod/RomInterfaces';
import { placeLevelObject, renderScreen } from "./pixi/pixiMod";
import { handleDragStart, handleDragMove, handleDragEnd, localDimsToGlobalX, pan, zeroNavObject, zoom } from "./pixi/pixiNav";
import ScreenPageData from "./rom-mod/tile-rendering/ScreenPageChunks";
import { getLevelByOffsetId } from './rom-mod/RomParser';
import { tick } from './pixi/pixiTick';
import LeftPanel from './components/LeftPanel';
import { writeLevel } from './rom-mod/export/compileManager';
import { compileLevelData } from './rom-mod/export/compiler';

function App() {
    const [pixiApp, setPixiApp] = useState<Application | null>(null);
    const [inputLoaded, setInputLoaded] = useState(false);
    const [textureCache, setTextureCache] = useState<Record<string,RenderTexture>>({});
    const [screenPageData, setScreenPageData] = useState<ScreenPageData[]>([]);
    const [romData, setRomData] = useState<RomData>();
    const [curLevelId, setCurLevelId] = useState(0);
    const [loading, setLoading] = useState(false);
    const [curSelectedObject, setCurSelectedObject] = useState<LevelObject | null>(null);
    const [interactiveSprite, setInteractiveSprite] = useState<Sprite | undefined>(undefined);

    const { loadRomFromArrayBuffer, romBuffer } = useContext(RomContext);

    // OnInit
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

    // Update interactive sprite data
    useEffect(() => {
        if (!interactiveSprite) {
            return;
        }
        if (!pixiApp) {
            return;
        }
        if (!romData) {
            console.error("No romData found");
            return;
        }
        const levelRef = getLevelByOffsetId(romData.levels,curLevelId);
        if (!levelRef) {
            console.error("No levelRef found");
            return;
        }

        interactiveSprite.off("pointerdown");
        interactiveSprite.on("pointerdown", (event: any) => {
            (window as any).spriteClicked(event);
            handleDragStart(pixiApp, event.data.global, curSelectedObject, screenPageData);
        });

        interactiveSprite.off("pointerup");
        interactiveSprite.on("pointerup", (e: any) => {
            const didMove = handleDragEnd(pixiApp, curSelectedObject, screenPageData);
            if (didMove) {
                rerenderPages();
            }
        });

        interactiveSprite.off("pointerupoutside");
        interactiveSprite.on("pointerupoutside", () => {
            const didMove = handleDragEnd(pixiApp, curSelectedObject, screenPageData);
            if (didMove) {
                rerenderPages();
            }
        })

        interactiveSprite.off("pointermove");
        interactiveSprite.on("pointermove", (e: any) => {
            const didMove = handleDragMove(pixiApp, e.data.global, curSelectedObject);
            if (didMove) {
                // Wipe all chunks
                replaceAllChunks();
                rerenderPages();
            }
        });
    // What the fuck is the purpose of this even? Don't you WANT custom dependencies??
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[curSelectedObject, curLevelId, romData, interactiveSprite]);

    /**
     * Rerenders every single ScreenPage
     * 
     * Does not reapply objects chunks
     */
    const rerenderPages = (noCache: boolean = false) => {
        const rerenderPerf = performance.now();
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
        screenPageData.forEach(sp => {
            renderScreen(levelRef,pixiApp,textureCache,setTextureCache,sp,noCache);
        });
        console.debug(`rerenderPages completed in ${performance.now() - rerenderPerf} ms`);
    };

    const _reapplySelect = () => {
        if (!curSelectedObject) {
            return;
        }
        ScreenPageData.applyEffectToSingleObject(curSelectedObject.uuid, screenPageData, "inverted");
    }

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
        const globalPxDims = localDimsToGlobalX(pixiApp,dims.x,dims.y);
        let trueXpx = globalPxDims.x;
        let trueYpx = globalPxDims.y;
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
                if (curSelectedObject === null) {
                    // No need to rerender if nothing is selected, and nothing is selected
                    return;
                }
                setCurSelectedObject(null);
                // Remove all inverted effects
                screenPageData.forEach(screenPageToWipeFX => {
                    screenPageToWipeFX.removeAllEffectsByEffect("inverted");
                });
                rerenderPages();
                return;
            }
            let foundObjects: LevelObject[] = [];
            found.forEach(ch => {
                const chObs = levelRef.objects.filter(x => x.uuid === ch.objUuidFrom);
                chObs.forEach(chob => {
                    if (!foundObjects.includes(chob)) {
                        foundObjects.push(chob);
                    }
                })
            });
            let selectedObject: LevelObject = foundObjects[0];
            if (foundObjects.length > 1) {
                let highestLayer = -9999999999;
                foundObjects.forEach(fo => {
                    if (fo.zIndex > highestLayer) {
                        highestLayer = fo.zIndex;
                    }
                });
                selectedObject = foundObjects.filter(x => x.zIndex === highestLayer)[0];
            }
            if (curSelectedObject && curSelectedObject.uuid === selectedObject.uuid) {
                // Nothing new was selected, don't do anything
                return;
            }
            ScreenPageData.applyEffectToSingleObject(selectedObject.uuid, screenPageData, "inverted");
            setCurSelectedObject(selectedObject);
            rerenderPages();
        } else {
            console.error("Unusual number of screen pages found:", foundScreenPages);
        }
    };

    /**
     * Deletes, then replacing all LevelObjects as chunks. Does not handle any
     * rendering/tilemap at all
     */
    const replaceAllChunks = () => {
        console.debug("replaceAllChunks");
        if (!romData) {
            console.error("No romData found");
            return;
        }
        const levelRef = getLevelByOffsetId(romData.levels,curLevelId);
        if (!levelRef) {
            console.error("No levelRef found");
            return;
        }
        screenPageData.forEach(sp => {
            sp.wipeChunks();
        });
        levelRef.objects.forEach(lobj => {
            placeLevelObject(lobj, levelRef, screenPageData, romBuffer);
        });
    }

    /**
     * This function runs when the GBA ROM file is loaded. It functions as a
     * general loader for everything as well
     * @param event FormEvent<HTMLInputElement>
     */
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

            const navContainer = new Container();
            navContainer.name = NAV_CONTAINER;
            pixiApp.stage.addChild(navContainer);

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
            pixiApp.ticker.add(delta => {
                tick(pixiApp,delta);
            });

            // Add interactive overlay
            const interactiveSprite = Sprite.from(textureCache[WHITE_SQUARE_RENDER_CODE]);
            interactiveSprite.interactive = true;
            interactiveSprite.alpha = 0;
            interactiveSprite.x = 0;
            interactiveSprite.y = 0;
            interactiveSprite.width = FULL_TILE_DIM_COUNT * FULL_TILE_DIMS_PX;
            interactiveSprite.height = FULL_TILE_DIM_COUNT * FULL_TILE_DIMS_PX;

            setInteractiveSprite(interactiveSprite);
            navContainer.addChild(interactiveSprite);

            zeroNavObject(navContainer);

            // Set up controls
            document.addEventListener("keydown", (ev: KeyboardEvent) => {
                switch (ev.key) {
                    case "ArrowDown":
                        pan(navContainer,"down");
                        break;
                    case "ArrowUp":
                        pan(navContainer,"up");
                        break;
                    case "ArrowRight":
                        pan(navContainer,"right");
                        break;
                    case "ArrowLeft":
                        pan(navContainer,"left");
                        break;
                    case "]":
                    case "=": // Is where + is, so they don't need to press shift
                    case "+":
                        zoom(navContainer,"in");
                        break;
                    case "-":
                    case "[":
                        zoom(navContainer, "out");
                        break;
                    case "0":
                        zoom(navContainer, "reset");
                        break;
                    case "Delete":
                    case "Backspace":
                        console.log("Doing delete");
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

    const changeLevel = (e: any) => {
        if (!pixiApp) {
            return;
        }
        if (!romData) {
            return;
        }
        const levelTargetId = Number(e.target.value);
        if (isNaN(levelTargetId)) {
            console.error(`Invalid target value "${e.target.value}"`,e);
            return;
        }
        console.log(`Selected level ID "0x${levelTargetId.toString(16)}"`);
        if (levelTargetId < 0 || levelTargetId > MAX_LEVEL_ENTRANCE_ID) {
            console.error("Selected out of bounds ID");
            return;
        }
        setLoading(true);
        window.setTimeout(() => {
            // Actually set level ID
            setCurLevelId(levelTargetId);

            setCurSelectedObject(null);
            screenPageData.forEach(sp => {
                sp.wipeChunks();
            });
            // Place level objects
            const levelRef = getLevelByOffsetId(romData.levels,levelTargetId);
            if (!levelRef) {
                return;
            }
            levelRef.objects.forEach(lobj => {
                placeLevelObject(lobj, levelRef, screenPageData, romBuffer);
            });
            rerenderPages(true);
            setLoading(false);
        },10);
    }

    const exportClicked = () => {
        if (!romData) {
            console.error("Cannot export without romData");
            return;
        }
        romData.levels.forEach(level => {
            const compiledLevel = compileLevelData(level,romBuffer);
            writeLevel(romBuffer,level,compiledLevel);
        });
        const blob = new Blob([romBuffer],{type: "application/octet-stream"});

        const downloadLink = document.createElement("a");
        downloadLink.id = "autoDownloadAnchor";
        downloadLink.download = "yoshis_island_mod.gba";
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
    }
    
    return (
        <div className="App">
            <LeftPanel selectedLevelObject={curSelectedObject}/>
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
                <button onClick={() => {rerenderPages(true)}} disabled={loading || !inputLoaded}>Re-render</button>
                <button onClick={replaceAllChunks} disabled={loading || !inputLoaded}>Replace Objects</button>
                <button onClick={_reapplySelect} disabled={loading || !inputLoaded}>Reapply Select</button>
                <button onClick={exportClicked} disabled={loading || !inputLoaded}>Export</button>

                <select disabled={loading || !inputLoaded} id="levelSelectSelector" onChange={changeLevel}>
                    {romData ? romData.levels.map(le => (
                        <option value={le.levelId} key={le.levelId}>{le.levelTitle}</option>
                    )) : null}
                </select>
                { inputLoaded === false ? <input type="file" onInput={fileOpened} disabled={loading}/> : null }
            </section>
        </div>
    );
}

export default App;
