import { Level } from "../RomInterfaces";

export function compilePrimaryLevelData(level: Level): number[] {
    let retBytes: number[] = [];
    if (!level || !level.objects) {
        console.error("Missing level objects");
        return retBytes;
    }
    return retBytes;
}