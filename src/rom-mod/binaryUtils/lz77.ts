export default function lz77decomp(romBuffer: Uint8Array, startAddress: number, len: number): number[] {
    let destArray: number[] = [];

    let source: number = startAddress;
    let dest: number = 0x00601000 - 0x00601000;
    source += 4;

    let byteCount = 0;
    let byteShift = 0;
    let writeValue = 0;

    while (len > 0) {
        let d = romBuffer[source++];

        if (d) {
            for (let i = 0; i < 8; i++) {
                if (d & 0x80) {
                    let data = romBuffer[source++] << 8;
                    data |= romBuffer[source++];
                    let length = (data >> 12) + 3;
                    let offset = (data & 0x0FFF);
                    let windowOffset = dest + byteCount - offset - 1;
                    for (let i2 = 0; i2 < length; i2++) {
                        writeValue |= (destArray[windowOffset++] << byteShift);
                        byteShift += 8;
                        byteCount++;

                        if (byteCount === 2) {
                            //CPUWriteHalfWord(dest, writeValue);
                            destArray[dest+1] = (writeValue >> 0x8);
                            destArray[dest] = (writeValue % 0x100);
                            dest += 2;
                            byteCount = 0;
                            byteShift = 0;
                            writeValue = 0;
                        }
                        len--;
                        if (len === 0) {
                            //console.log(1);
                            return destArray;
                        } 
                    }
                } else {
                    writeValue |= (romBuffer[source++] << byteShift);
                    byteShift += 8;
                    byteCount++;
                    if (byteCount === 2) {
                        //CPUWriteHalfWord(dest, writeValue);
                        destArray[dest+1] = (writeValue >> 0x8);
                        destArray[dest] = (writeValue % 0x100);
                        dest += 2;
                        byteCount = 0;
                        byteShift = 0;
                        writeValue = 0;
                    }
                    len--;
                    if (len === 0) {
                        //console.log(2);
                        return destArray;
                    }
                }
                d <<= 1;
            }
        } else {
            for (let i = 0; i < 8; i++) {
                writeValue |= (romBuffer[source++] << byteShift);
                byteShift += 8;
                byteCount++;
                if (byteCount === 2) {
                    //CPUWriteHalfWord(dest, writeValue);
                    destArray[dest+1] = (writeValue >> 0x8);
                    destArray[dest] = (writeValue % 0x100);
                    dest += 2;
                    byteShift = 0;
                    byteCount = 0;
                    writeValue = 0;
                }
                len--;
                if (len === 0) {
                    //console.log(3);
                    return destArray;
                }
            }
        }
    }
    return destArray;
}