export function readByte(rom: Uint8Array, addr: number): number {
    return rom[addr];
}

/**
 * Returns the value of a Word (2 byte value) at addr
 * @param rom The RomBuffer
 * @param addr The address of the Word
 * @returns Number representation of the Word
 */
 export function readWord(rom: Uint8Array, addr: number): number {
    return rom[addr] + (rom[addr+1] << 8);
}

export function readByteFromArray(
    rom: Uint8Array,
    baseAddr: number,
    index: number
): number {
    const addr = baseAddr + index;
    return rom[addr];
}

export function readWordFromArray(
    rom: Uint8Array,
    baseAddr: number,
    index: number
): number {
    const addr = baseAddr + (index * 2);
    return rom[addr] + (rom[addr+1] << 8);
}

/**
 * Retrieve an address (as base10 index) at a specified address
 * @param rom Uint8Array holding the ROM's binary data
 * @param addressOfAddress Index of address in binary
 * @returns Address (as base10 index) specified at addressOfAddress
 */
export function readAddress(rom: Uint8Array, addressOfAddress: number): number {
    if (rom[addressOfAddress+3] !== 8) {
        console.warn(`IO Error: Addresses should always start with 0x08! Found "${rom[addressOfAddress+3].toString(16)}" at 0x08${addressOfAddress.toString(16).padStart(6)}`);
        return -1;
    }
    return (rom[addressOfAddress+2] << 16) + (rom[addressOfAddress+1] << 8) + (rom[addressOfAddress+0]);
}

export function readAddressFromArray(rom: Uint8Array, address: number, index: number): number {
    // Multiply index by 4, because addresses are 4 bytes
    const baseAddr = address + (index * 4);
    return readAddress(rom, baseAddr);
}

export function writeArrayToIndex(rom: Uint8Array, address: number, data: number[]): void {
    for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
        rom[address+dataIndex] = data[dataIndex] + 0;
    }
}

/**
 * Writes or overwrites another address in the ROM Buffer
 * @param rom The RomBuffer
 * @param writeLocation The address (location) where you want to write to
 * @param newAddressValue The address you wish to write
 */
export function writeAddressToIndex(rom: Uint8Array, writeLocation: number, newAddressValue: number): void {
    const arrayToWrite: number[] = [
        newAddressValue % 0x100,
        (newAddressValue >> 8) % 0x100,
        newAddressValue >> 16,
        8
    ];
    for (let i = 0; i < 4; i++) {
        rom[writeLocation+i] = arrayToWrite[i];
    }
}