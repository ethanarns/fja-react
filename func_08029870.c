// Attempt 1 (likely broken)

if (
    array_1[curobj_id_oroffset >> 1] + curobj_relX +
    array_2[curobj_id_oroffset >> 1][curobj_relY] * 2
    != 0
&&
    DAT_03007010 + (USHORT_03002256 << 2) = array_1[curobj_id_oroffset >> 1] +
    (
        curobj_relX + array_2[curobj_id_oroffset >> 1][curobj_relY]
    ) * 2

    ,curobj_relY + 1 == current_object_height
) {
  // Stuff
}

// Attempt 2. Remember, Ignore &FFFF, that's to force a 16 bit object, and "* 0x2000" is the same thing as << 11