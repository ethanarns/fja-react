import { createContext, ReactNode, useState } from "react";
import { Level } from "./RomInterfaces";

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

    levels: Level[];
    setLevels: (value: any) => void;
}

const romContextInit: RomContextProps = {
    romBuffer: new Uint8Array(),
    setRomBuffer: () => undefined,
    levels: [],
    setLevels: () => undefined
};

export const RomContext = createContext<RomContextProps>(romContextInit);

export default function RomProvider(props: { children: ReactNode}) {

    const [romBuffer, setRomBuffer] = useState<Uint8Array>(new Uint8Array());
    const [levels, setLevels] = useState<Level[]>([]);

    return (
        <RomContext.Provider
            value={{
                romBuffer,
                setRomBuffer,
                levels,
                setLevels
            }}
        >
            {props.children}
        </RomContext.Provider>
    )
}