import { useEffect, useState } from "react";
import { CANVAS_HEIGHT } from "../GLOBALS";
import { LevelObject } from "../rom-mod/RomInterfaces";
import { ObjectRecord, OBJECT_RECORDS } from "../rom-mod/tile-rendering/objectRecords";

import "./LeftPanel.css";

interface LeftPanelProps {
    selectedLevelObject: LevelObject | null;
}

export const LEFT_PANEL_WIDTH = 200;

export default function LeftPanel(props: LeftPanelProps) {

    const [curObjectData, setCurObjectData] = useState<ObjectRecord | null>(null);

    useEffect(() => {
        const lo = props.selectedLevelObject;
        if (lo === null) {
            return;
        }
        const objectRecord = OBJECT_RECORDS.filter( x => {
            return x.objectType === lo.objectType
                && (lo.objectStorage === "s4byte") === x.isExtended
                && lo.objectId === x.objectId;
        });
        if (objectRecord.length === 1) {
            setCurObjectData(objectRecord[0]);
        } else if (objectRecord.length > 1) {
            console.error("DUPLICATE OBJECT RECORDS FOUND");
        } else {
            setCurObjectData(null);
        }
    },[props.selectedLevelObject]);

    return (
        <div style={{
            width: LEFT_PANEL_WIDTH,
            height: CANVAS_HEIGHT,
            float: "left"
        }}>
            <h3>Object Info</h3>
            { curObjectData === null || props.selectedLevelObject === null? null : (
                <ul>
                    <li>{curObjectData.prettyName}</li>
                    <hr style={{
                        margin: 5,
                        width: LEFT_PANEL_WIDTH - 50
                    }}/>
                    <li className="description">
                        {curObjectData.textDescription ? curObjectData.textDescription : "Not documented"}
                    </li>
                    <hr style={{
                        margin: 5,
                        width: LEFT_PANEL_WIDTH - 50
                    }}/>
                    <li>{"Dimensions: "}
                        {props.selectedLevelObject.dimX ? props.selectedLevelObject.dimX + "x, " : ""}
                        {props.selectedLevelObject.dimY ? props.selectedLevelObject.dimY + "y" : ""}
                        {props.selectedLevelObject.dimZ ? props.selectedLevelObject.dimZ + "z" : ""}</li>
                </ul>
            )}
        </div>
    )
}