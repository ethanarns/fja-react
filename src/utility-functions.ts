import { MainLevelDataOffset } from "./rom-mod/RomInterfaces";

// I'm lazy
// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid/2117523#2117523
export function getUuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        // eslint-disable-next-line no-mixed-operators
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Gets the level id, mainly used to get the name of the level
 * @param currentWorld number
 * @param currentLevel number
 * @returns Level number, starting with zero
 */
export function getMainLevelDataOffsetByLevelIndex(currentWorld: number, currentLevel: number): MainLevelDataOffset {
    // The actual way these are stored is multiplied by 2
    currentLevel *= 2;
    currentWorld *= 2;
    return (currentWorld*6) + (currentLevel >> 1);
}