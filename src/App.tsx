import './App.css';
import { PHASER_CANVAS_ID, SCENE_ID } from './GLOBALS';
import { FormEvent, useContext, useEffect, useState } from 'react';
import Phaser from 'phaser';
import { gameConfig } from "./phaser/GameConfig";
import { RomContext } from './rom-mod/RomProvider';
import RenderScene from './phaser/RenderScene';

function App() {
    const [game, setGame] = useState<Phaser.Game | null>(null);
    const [inputLoaded, setInputLoaded] = useState(false);

    const { loadRomFromArrayBuffer } = useContext(RomContext);

    // Basically on load
    useEffect(() => {
        setGame(new Phaser.Game(gameConfig));
    },[]);

    const fileOpened = (event: FormEvent<HTMLInputElement>) => {
        if (!game) {
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
            
            const scene = game.scene.getScene(SCENE_ID) as RenderScene;
            scene.updateRomData(loadedGameData.levels[0]);
        }).catch((err: any) => {
            console.error("Error caught when trying to load ROM:");
            console.error(err);
        });
    }
    
    return (
        <div className="App">
            <div id={PHASER_CANVAS_ID}></div>
            { inputLoaded === false ? <input type="file" onInput={fileOpened}/> : null }
        </div>
    );
}

export default App;
