import './App.css';
import { PHASER_CANVAS_ID, SCENE_ID } from './GLOBALS';
import { useEffect, useState } from 'react';
import Phaser from 'phaser';
import RenderScene from "./phaser/RenderScene";
import { gameConfig } from "./phaser/GameConfig";



function App() {

    const [game, setGame] = useState<Phaser.Game | null>(null);
    const [inputLoaded, setInputLoaded] = useState(false);

    // Basically on load
    useEffect(() => {
        setGame(new Phaser.Game(gameConfig));
    },[]);

    const fileOpened = (event: any) => {
        if (!game) {
            return;
        }
        const scene = game.scene.getScene(SCENE_ID) as RenderScene;
        console.log(event);
        scene.addObject();
        setInputLoaded(true);
    }
    
    return (
        <div className="App">
            <div id={PHASER_CANVAS_ID}></div>
            { inputLoaded === false ? <input type="file" onInput={fileOpened}/> : null }
        </div>
    );
}

export default App;
