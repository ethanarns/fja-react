import { useEffect, useState } from "react";
import { CANVAS_HEIGHT } from "../GLOBALS";
import { getObjectTypePretty, LevelObject } from "../rom-mod/RomInterfaces";
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
            setCurObjectData(null);
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
            setCurObjectData({
                objectType: lo.objectType,
                isExtended: lo.objectStorage === "s4byte",
                objectId: lo.objectId,
                textDescription: "Not documented",
                prettyName: "Not documented"
            });
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
                        {curObjectData.textDescription ? curObjectData.textDescription : ""}
                        {` [0x${curObjectData.objectId.toString(16)}-${
                            getObjectTypePretty(props.selectedLevelObject.objectStorage,props.selectedLevelObject.objectType)
                        }]`}
                    </li>
                    <hr style={{
                        margin: 5,
                        width: LEFT_PANEL_WIDTH - 50
                    }}/>
                    <li>{"Raw Dimensions: "}
                        {props.selectedLevelObject.dimX !== undefined ? "x" + props.selectedLevelObject.dimX + " " : ""}
                        {props.selectedLevelObject.dimY !== undefined ? "y" + props.selectedLevelObject.dimY + " " : ""}
                        {props.selectedLevelObject.dimZ !== undefined ? "z" + props.selectedLevelObject.dimZ + " " : ""}
                        {
                            (props.selectedLevelObject.dimZ === undefined &&
                            props.selectedLevelObject.dimY === undefined &&
                            props.selectedLevelObject.dimZ === undefined) ? "N/A" : ""
                        }</li>
                </ul>
            )}
        </div>
    )
}