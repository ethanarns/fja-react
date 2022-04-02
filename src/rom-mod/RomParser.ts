import { RomData } from "./RomInterfaces";

export function getRomDataFromBuffer(romBuffer: Uint8Array): RomData {
    let romData: RomData = {
        levels: []
    };
    return romData;
}