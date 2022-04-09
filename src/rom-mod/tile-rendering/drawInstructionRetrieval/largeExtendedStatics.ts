import { LayerOrder, Level, LevelObject } from "../../RomInterfaces";
import { DrawInstruction } from "../tile-construction-tile-keys";
import { readAddressFromArray, readByteFromArray, readWord } from "../../binaryUtils/binary-io";
import { getTileRenderCodesFromTilecode } from "./commonInstructions";

// 0x081be854
const BLUEROCKS_STATICS_ARRAY = 0x001be854;
// 0x081be884
const BLUEROCKS_LENGTHS_ARRAY = 0x001be884;

export function bigBlueRocks(lo: LevelObject, level: Level, romBuffer: Uint8Array): DrawInstruction[] {
    let ret: DrawInstruction[] = [];

    // Constant
    const offsetId = lo.objectId - 0xd4;
    const brStaticsAddr = readAddressFromArray(romBuffer, BLUEROCKS_STATICS_ARRAY, offsetId);

    const brLengthsAddr = readAddressFromArray(romBuffer, BLUEROCKS_LENGTHS_ARRAY, offsetId);

    let _overflow_max = 8;
    let _overflow = 0;
    let lengthIndex = 0;
    let prevLength = 0;
    let lastGoodCurLength = 0;
    let shouldBreak = false;

    while (_overflow < _overflow_max) {
        let length = readByteFromArray(romBuffer, brLengthsAddr, lengthIndex + 1) + 0;
        let curLength = length - prevLength;
        prevLength = length;
        if (length === 0) {
            shouldBreak = true;
            if (lengthIndex < 4) {
                break;
            }
        }
        if (curLength > 0) {
            lastGoodCurLength = curLength + 0;
        }
        if (curLength < 0) {
            curLength = lastGoodCurLength;
        }

        for (let xIndex = 0; xIndex < curLength; xIndex++) {
            // You need to offset the previous values by length each time
            const brStaticsValue = readWord(romBuffer, brStaticsAddr + (
                xIndex + (curLength * lengthIndex)
            ) * 2);
            ret.push({
                offsetX: xIndex,
                offsetY: lengthIndex,
                uniqueLevelObjectId: lo.uuid,
                layer: LayerOrder.ROCKS,
                renderCodes: getTileRenderCodesFromTilecode(romBuffer,brStaticsValue)
            });
        }
        lengthIndex++;
        _overflow++;
        if (shouldBreak) {
            break;
        }
        if (_overflow > _overflow_max) {
            console.error("Overflow when trying to get instructions for object:", lo);
            break;
        }
    }
    return ret;
}

// function OBJFUNC_4byte_giantrocks(): void {
//     let curobj_relX = 0;
//     let curobj_relY = 0;
//     let curobj_id_oroffset = 0xC;
//     let curobj_absCoords: number = 0x6983;
//     let uVar1;
//     let uVar2;
//   if ((*(array_pointers_bluerockstatics_1[curobj_id_oroffset >> 1] +
//                  ((curobj_relX +
//                   array_pointers_bluerockstatics_2[curobj_id_oroffset >> 1]
//                               [curobj_relY]) * 0x20000 >> 0x10)) != 0) &&
//      (*(DAT_03007010 + (cur_tile_index_layer1_tilemap_maybe >> 1) * 2) =
//            *(array_pointers_bluerockstatics_1[curobj_id_oroffset >> 1] +
//                      ((curobj_relX +
//                       array_pointers_bluerockstatics_2[curobj_id_oroffset >> 1]
//                                   [curobj_relY]) * 0x20000 >> 0x10)),
//      (curobj_relY + 1) == current_object_height)) {
//     uVar1 = drawing_related_posmaybe(curobj_absCoords);
//     uVar2 = 0;
//     do {
//       if (*(DAT_03007010 + (uVar1 & 0xfffe)) == *(&DAT_081be8b4 + uVar2)) {
//         *(DAT_03007010 + (uVar1 & 0xfffe)) =
//              *(&DAT_081be8b8 + uVar2);
//         return;
//       }
//       uVar2 = uVar2 + 2 & 0xffff;
//     } while (uVar2 < 4);
//   }
//                     /* WARNING: Read-only address (ram,0x0300224e) is written */
//                     /* WARNING: Read-only address (ram,0x03002254) is written */
//                     /* WARNING: Read-only address (ram,0x03002256) is written */
//                     /* WARNING: Read-only address (ram,0x03002258) is written */
//                     /* WARNING: Read-only address (ram,0x0300225c) is written */
//                     /* WARNING: Read-only address (ram,0x0300225e) is written */
//   return;
// }

// export function bigBlueRocks2(lo: LevelObject, level: Level, romBuffer: Uint8Array): void {
//     // 03002254
//     let curobj_absCoords: number = 0x6983;
//     let current_object_height: number = -1;
//     // 224e
//     let curobj_id_oroffset: number = 0xc;
//     // 225c
//     let curobj_relY: number = 0;
//     let curobj_relX: number = 0;
//     let cur_tile_index_layer1_tilemap_maybe: number = 0x0304;
//     // 03007010
//     let dynMemAddrLoadStates = 0x0200000c;

//     let mem02_0C = -0x9999;

//     // command // <addr> = what line
//     function drawing_related_posmaybe(absCords: number): number {
//         let r0 = 0x0300220c;
//         let r1 = absCords;
//         // r2 here is 0x04 (in current test)
//         let r2 = curobj_relY; // 08019a9a
//         let r3 = 0x0f;
//         r3 = r3 & r2; // 08019a9e
//         r2 = r2 << 0x18;
//         r0 = 0xf0;
//         r0 = r0 << 0x18; // 08019aa4
//         r0 = r0 & r2;
//         r3 = r3 << 0x14;
//         r3 = r3 | r0; // 08019aaa
//         r3 = r3 >> 0x10; // 08019aac
//         r0 = 0x0f0; // 08019aae
//         r0 = r0 << 0x4;
//         r2 = r0 + 0; // 08019ab2
//         r0 = r1 + 0;
//         r0 = r0 | r2; // ...b6
//         r0 = r0 + 0x10; // 08019ab8
//         r0 = r0 | r2; // 08019aba
//         r0 = r0 + r3; // 08019ac0
//         r0 = r0 << 0x10;
//         r2 = 0x70f00000;
//         r2 = r2 & r0; // 08019ac6
//         r0 = 0xF0F;
//         r0 = r0 & r1; // 08019aca
//         r0 = r0 << 0x10;
//         r0 = r0 | r2; // 08019ace
//         r2 = 0xff; // 08019ad0
//         r2 = r2 << 0x10;
//         r2 = r2 & r0; // 08019ad4
//         r2 = r2 >> 0xf; // 08019ad6
//         r0 = r0 >> 0x18; // 08019ad8
//         r1 = 0x0201b800 // 08019ada
//         r0 = r0 + r1; // 08019adc
//         // Loads from 0x0201b800 + r0
//         r0 = 1; // 08019ade // Was 1, but could be anything
//         r0 = r0 << 0x8;
//         r1 = 0xfc; // 08019ae2
//         r1 = r1 << 0x6; // 08019ae4
//         r0 = r0 & r1;
//         r0 = r0 << 0x1; // 08019ae8
//         r0 = r0 | r2; // 08019aea
//         return r0;
//     }

//     function OBJFUNC_4byte_giantrocks() {
//         let r1 = curobj_id_oroffset;
//         let r4 = curobj_relY; // 0802987c
//         let r0 = 0x001be884;
//         let r3 = 0x0220c
//         let r2 = r1 / 2;
//         let r5 = -9999;
//         let r6 = -999999;
//         r2 = r2 * 4; // 08029882
//         r0 = r2 + r0; // 08029884
//         r1 = readAddress(romBuffer,r0); // 08029886
//         r1 = r1 + r4;
//         r0 = curobj_relX; // 0802988e
//         r1 = readByte(romBuffer,r1); // 08029890
//         r0 = r0 + r1;
//         r0 = r0 << 0x11; // 08029894
//         r1 = 0x001be854;
//         r2 = r2 + r1;
//         r1 = readAddress(romBuffer,r2); // 0802989a
//         r0 = r0 >> 0x10;
//         r0 = r0 + r1; // 0802989e
//         r5 = readWord(romBuffer,r0); // 080298a0
//         if (r5 === 0) { // 080298a2
//             return; // 080298a4
//         }
//         r0 = 9999999; // 080298a8
//         r1 = cur_tile_index_layer1_tilemap_maybe; // 080298aa
//         r6 = 0x03007010; // 080298ac
//         r0 = dynMemAddrLoadStates; // 080298ae
//         r1 = r1 >> 1;
//         r1 = r1 << 1; // 080298b2
//         mem02_0C = r5; // 080298b6
//         r5 = curobj_relY; // 080298b8
//         r0 = r5 + 1;
//         r0 = r0 << 0x10; // 080298bc
//         r5 = r0 >> 0x10; // 080298be
//         r0 = current_object_height; // 080298c4
//         if (r5 !== r0) { // 080298c6
//             return; // 080298c8
//         }
//         r0 = r3 + 0;
//         r1 = curobj_absCoords; // 080298ce
//         r0 = r3 + 0;
//         const funcRes = drawing_related_posmaybe(r1);
//         080298d6 00 24           mov        r4, #0x0
//         080298d8 31 68           ldr        r1, [r6,#0x0]=>DAT_03007010                      = ??
//         080298da 0c 4a           ldr        r2, [DAT_0802990c]                               = 0000FFFEh
//         080298dc 02 40           and        r2, r0
//         080298de 89 18           add        r1, r1, r2
//         080298e0 0d 88           ldrh       r5, [r1,#0x0]
//         080298e2 0b 4f           ldr        r7, [PTR_DAT_08029910]                           = 081be8b4
//         080298e4 0b 49           ldr        r1, [PTR_DAT_08029914]                           = 081be8b8
//                              LAB_080298e6                                    XREF[1]:     08029920(j)  
//         080298e6 60 08           lsr        r0, r4, #0x1
//         080298e8 43 00           lsl        r3, r0, #0x1
//         080298ea d8 19           add        r0, r3, r7
//         080298ec 00 88           ldrh       r0, [r0,#0x0]=>DAT_081be8b4                      = 100Fh
//                                                                                              = 0C0Bh
//         080298ee 85 42           cmp        r5, r0
//         080298f0 12 d1           bne        LAB_08029918
//         080298f2 58 18           add        r0, r3, r1
//         080298f4 05 88           ldrh       r5, [r0,#0x0]=>DAT_081be8b8                      = 100Eh
//         080298f6 30 68           ldr        r0, [r6,#0x0]=>DAT_03007010                      = ??
//         080298f8 80 18           add        r0, r0, r2
//         080298fa 05 80           strh       r5, [r0,#0x0]
//         return r0;
//         08029918 a0 1c           add        r0, r4, #0x2
//         0802991a 00 04           lsl        r0, r0, #0x10
//         0802991c 04 0c           lsr        r4, r0, #0x10
//         0802991e 03 2c           cmp        r4, #0x3
//         08029920 e1 d9           bls        LAB_080298e6
//         return r0;

//     }

//     OBJFUNC_4byte_giantrocks();
//             // console.log(
//         //     `r0=${r0.toString(16)}`,
//         //     `r1=${r1.toString(16)}`,
//         //     `r2=${r2.toString(16)}`,
//         //     `r3=${r3.toString(16)}`,
//         //     `r4=${r4.toString(16)}`,
//         //     `r5=${r5.toString(16)}`,
//         //     `r6=${r6.toString(16)}`
//         // );
// }