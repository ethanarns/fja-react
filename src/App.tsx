import './App.css';
import { DOM_CANVAS_ID } from './GLOBALS';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { RomContext } from './rom-mod/RomProvider';
import generatePixiApp from './pixi/getPixiApp';
import { Application } from "pixi.js"
import { generateGraphics, getAllChunkCodes } from './rom-mod/tile-rendering/tile-render-main';
import { placeGraphic } from "./pixi/pixiConnection";

function App() {
    const [pixiApp, setPixiApp] = useState<Application | null>(null);
    const [inputLoaded, setInputLoaded] = useState(false);

    const { loadRomFromArrayBuffer } = useContext(RomContext);

    // Basically on load
    useEffect(() => {
        const newPixiApp = generatePixiApp();
        setPixiApp(newPixiApp);
    },[]);

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

            const graphics = generateGraphics(loadedGameData.levels[0]);
            const codes = getAllChunkCodes();
            codes.forEach((code: string, index: number) => {
                const x = index % 10;
                const y = Math.floor(index / 10);
                placeGraphic(graphics[code],x*10,y*10,pixiApp, code);
            });
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
