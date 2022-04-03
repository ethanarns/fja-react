import { createContext, ReactNode, useState } from "react";
import { RomData } from "./RomInterfaces";
import { getRomDataFromBuffer } from "./RomParser"

interface RomContextProps {
    /**
     * This holds the binary data for the game
     * It is what is both imported and exported
     * Can be accessed like an array of numbers
     */
    romBuffer: Uint8Array;
    /**
     * Use this sparingly, hard to set properly
     * Basically only for modifying before export
     */
    setRomBuffer: (value: any) => void;

    loadRomFromArrayBuffer: (arrayBuffer: ArrayBuffer) => RomData;

    romData: RomData;
    setRomData: (romData: RomData) => void;
}

const EMPTY_ROM_DATA: RomData = {
    levels: []
};

const romContextInit: RomContextProps = {
    romBuffer: new Uint8Array(),
    setRomBuffer: () => undefined,
    loadRomFromArrayBuffer: () => EMPTY_ROM_DATA,
    romData: EMPTY_ROM_DATA,
    setRomData: () => undefined
};

export const RomContext = createContext<RomContextProps>(romContextInit);

export default function RomProvider(props: { children: ReactNode}) {

    const [romBuffer, setRomBuffer] = useState<Uint8Array>(new Uint8Array());
    const [romData, setRomData] = useState<RomData>(EMPTY_ROM_DATA);

    const loadRomFromArrayBuffer = (arrayBuffer: ArrayBuffer): RomData => {
        const newRomBuffer = new Uint8Array(arrayBuffer);
        // Use this State for exporting later
        setRomBuffer(newRomBuffer);
        const initRomData = getRomDataFromBuffer(newRomBuffer);
        // Use this State for things like level data, objects
        setRomData(initRomData);
        return initRomData;
    }

    return (
        <RomContext.Provider
            value={{
                romBuffer,
                setRomBuffer,
                loadRomFromArrayBuffer,
                romData,
                setRomData
            }}
        >
            {props.children}
        </RomContext.Provider>
    )
}