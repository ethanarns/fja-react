import { Level, RomData } from "./RomInterfaces";
import { overwriteLevelByOffsetId } from "./RomParser";

export type ActionType = "moveLevelObject" | "deleteLevelObject";

/**
 * Represents a single change to any sort of level data.
 * 
 * The strings are encoded JSON of RomData.
 */
export interface UndoableAction {
    formerLevelDataStr: string;
    newLevelDataStr: string;
    levelIdOn: number;
    actionType: ActionType;
}

let guiActionsTaken: UndoableAction[] = [];
let guiActionsTakenIndex: number = -1;

export function addActionToUndo(action: UndoableAction): void {
    console.log("Adding action to undo");
    if (!action.formerLevelDataStr) {
        console.error("Missing former level data:",action.formerLevelDataStr);
        return;
    }
    if (!action.newLevelDataStr) {
        console.error("Missing new level data string:",action.newLevelDataStr);
        return;
    }
    if (guiActionsTaken.length - 1 === guiActionsTakenIndex) {
        // The index is at the end, nothing to delete
        guiActionsTaken.push(action);
        guiActionsTakenIndex++;
    } else {
        // Mismatch, first delete everything above the index
        guiActionsTaken = guiActionsTaken.slice(0,guiActionsTakenIndex+1);
        guiActionsTaken.push(action);
        // Set it to the end
        guiActionsTakenIndex = guiActionsTaken.length - 1;
    }
}

/**
 * Updates the rom state with previous state
 * @returns true if successful, false if not
 */
export function undoClicked(romData: RomData): boolean {
    if (0 > guiActionsTakenIndex) {
        console.warn("Cannot undo, index below zero");
        return false;
    }
    const actionToReverse: UndoableAction = guiActionsTaken[guiActionsTakenIndex];
    // Decrement index, but don't modify the array
    guiActionsTakenIndex--;
    const actionData = JSON.parse(actionToReverse.formerLevelDataStr) as Level;
    overwriteLevelByOffsetId(romData.levels,actionToReverse.levelIdOn,actionData);
    return true;
}

export function getCanUndo(): boolean {
    return !(0 > guiActionsTakenIndex);
}

export function getCanRedo(): boolean {
    return !(guiActionsTaken.length - 1 === guiActionsTakenIndex);
}

export function redoClicked(romData: RomData): boolean {
    if (guiActionsTaken.length - 1 === guiActionsTakenIndex) {
        console.warn("Cannot redo, at head");
        return false;
    }
    // Increment the index before taking data this time (++var modifies THEN returns)
    const actionToRedo: UndoableAction = guiActionsTaken[++guiActionsTakenIndex];
    overwriteLevelByOffsetId(romData.levels,actionToRedo.levelIdOn,JSON.parse(actionToRedo.newLevelDataStr));
    return true;
}

/**
 * Wipes the actions you can undo list, and sets the index to -1
 */
export function wipeUndos(): void {
    guiActionsTaken = [];
    guiActionsTakenIndex = -1;
}