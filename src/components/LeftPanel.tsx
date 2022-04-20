import { CANVAS_HEIGHT } from "../GLOBALS";
import { LevelObject } from "../rom-mod/RomInterfaces";

interface LeftPanelProps {
    selectedLevelObject?: LevelObject;
}

export const LEFT_PANEL_WIDTH = 200;

export default function LeftPanel(props: LeftPanelProps) {
    return (
        <div style={{
            width: LEFT_PANEL_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: "grey"
        }}>
            Todo
        </div>
    )
}