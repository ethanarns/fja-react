// Attempt 2. Remember, Ignore &FFFF, that's to force a 16 bit object, and "* 0x2000" is the same thing as << 11

void OBJFUNC_4byte_giantrocks() {
    uint uVar1;
    uint uVar2;
    var blueRockConst1 = array_pointers_bluerockstatics_1[curobj_id_oroffset >> 1];
    var blueRockConst2 = array_pointers_bluerockstatics_2[curobj_id_oroffset >> 1][curobj_relY];
    var const1Offset = blueRockConst1 + ((curobj_relX + blueRockConst2) >> 3);

    *(DAT_03007010 + (cur_tile_index_layer1_tilemap_maybe >> 1) * 2) = *const1Offset;
    
    if (*const1Offset != 0 && curobj_relY + 1 == current_object_height) {
        uVar1 = drawing_related_posmaybe(&UNK_0300220c, curobj_absCoords);
        uVar2 = 0;
        do
        {
            if (*(DAT_03007010 + uVar1) == *(&DAT_081be8b4 + uVar2))
            {
                *(undefined2 *)(DAT_03007010 + uVar1) = *(undefined2 *)(&DAT_081be8b8 + uVar2);
                return;
            }
            uVar2 = uVar2 + 2;
        } while (uVar2 < 4);
    }
}

uint drawing_related_posmaybe(uint absolutePosition) {
    uint uVar1 = absolutePosition << 0x10 | (
        (absolutePosition | 0xf00) + 0x10 | 0xf00
    ) + ( (curobj_relY << 0x14 | (curobj_relY) << 0x18) >> 0x10 ) * 0x10000 & 0x70f00000;

    return ((&DAT_0201b800)[uVar1 >> 0x18]) << 9 | (uVar1 & 0xff0000) >> 0xf;
}