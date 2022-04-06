import { LayerOrder } from "../RomInterfaces";

export interface TileChunkPreRenderData {
    tileId: number;
    paletteId: number;
    flipH: boolean;
    flipV: boolean;
}

export interface DrawInstruction {
    /**
     * In Tile-Scale, not chunk or pixel
     */
    offsetX: number;
    /**
     * In Tile-Scale, not chunk or pixel
     */
    offsetY: number;
    uniqueLevelObjectId: string;
    layer: LayerOrder;
    renderCodes: string;
}

export type RenderedTileDataName = string;

export const RENDERED_TILE_DEFAULTS: Record<RenderedTileDataName,string> = {
    "platform_brown_zig_zag_right": "108d,108e,109d,109e",
    "platform_brown_zig_zag_left": "108c,108d,109c,109d",
    "platform_brown_zig_zag_middle": "108d,108d,109d,109d",
    "stone_square_color1": "0x081b1520",
    "green_pipe_top_left": "0x081b7670",
    "green_pipe_top_right": "0x081b7678",
    "green_pipe_top_left_flipped": "3a68,3a69,3a58,3a59",
    "green_pipe_top_right_flipped": "388f,389f,3a78,3a79",
    "platform_thin_wood": "0x081b4520",
    "block_egg_green": "0x081b5b98",
    "sign_arrow_red_base_left": "1090,1091,10ee,1093",
    "sign_arrow_red_top_left": "10ee,10ee,1080,1081",
    "sign_arrow_red_base_right": "1092,10ee,10ee,10ee",
    "sign_arrow_red_top_right": "10ee,10ee,1082,1083",
    "sign_arrow_leftwards_red_base_left": "14ee,1492,14ee,14ee",
    "sign_arrow_leftwards_red_top_left": "14ee,14ee,1483,1482",
    "sign_arrow_leftwards_red_base_right": "1491,1490,1493,14ee",
    "sign_arrow_leftwards_red_top_right": "14ee,14ee,1481,1480",
    "pipe_green_bottom_left_end": "30e8,30e9,3268,3269",
    "pipe_green_bottom_right_end": "30ea,30eb,308f,309f",
    "pipe_green_middle_left": "30e8,30e9,30f8,30f9",
    "pipe_green_middle_right": "30ea,30eb,30fa,30fb",
    "thin_wooden_platform": "405e,405f,40ff,40ff",
    "poundable_post_top": "400E,400F,401E,401F",
    "poundable_post_middle": "402e,402f,403e,403f",
    "poundable_post_bottom": "403e,403f,404e,404f",
    "donut_lift":"1084,1085,1094,1095",
    "castle_brick_brown_left": "414c,414d,415c,415d",
    "castle_brick_brown_right": "414e,414f,415e,415f",
    "castle_interior_brown_pillar_top": "414a,414b,415a,415b",
    "castle_interior_brown_pillar_middle": "416e,416f,417e,417f",
    "castle_interior_brown_pillar_bottom": "418e,418f,419e,419f",
    "castle_interior_thin_brown_platform": "51ad,51ae,51ce,51be",
    "castle_interior_static_log_left": "4140,4141,4150,4151",
    "castle_interior_static_log_middle": "4142,4143,4152,4153",
    "castle_interior_static_log_right": "4144,4145,4154,4155",
    "ground1_top_fuzz":"40ff,40ff,4044,4045",
    "ground1_top_base":"4054,4055,4064,4065",
    "ground1_fill":"406f,407e,407f,406e",
    "ground1_slope_45_topfuzz": "44ff,44ff,44ff,4009",
    "ground1_slope_45_top": "4018,4019,4028,4029",
    "ground1_slope_30_base": "403a,403b,404a,404b",
    "ground1_slope_30_top": "401a,401b,402a,402b",
    "ground1_slope_30_secondbase": "401c,401d,402c,402d",
    "ground1_slope_30_secondtop": "44ff,44ff,400c,400d",
    "flower_ground_base_1": "4166,4167,4176,4177",
    "flower_ground_fuzz_1": "4146,4147,4156,4157",
    "flower_ground_fuzz_2": "4148,4149,4158,4159",
    "flower_ground_fill_1": "4500,4500,4500,4500",
    "flower_ground_slope_downright_base_1": "4112,4113,4122,4123",
    "flower_ground_slope_downright_fuzz_1": "40ee,40ee,4102,4103",
    "flower_ground_slope_downright_fuzz_2": "4110,4111,4120,4121",
    "flower_ground_slope_downright_30_base_1": "4513,4512,4523,4522",
    "flower_ground_slope_downright_30_halfbase_1": "4511,4510,4521,4520",
    "flower_ground_slope_downright_30_fuzz_1": "44ee,44ee,4503,4502",
    "flower_ground_slope_downright_45_base_1": "4114,4115,4124,4125",
    "flower_ground_slope_downright_45_fuzz_1": "40ee,40ee,4104,4105",
    "flower_ground_slope_downright_45_belowbase_1": "4134,4135,4144,4145",
    "flower_ground_side_left_top": "4543,4542,4553,4552",
    "flower_ground_side_left": "4563,4562,4573,4572",
    "flower_ground_side_right_top": "4142,4143,4152,4153",
    "flower_ground_side_right": "4162,4163,4172,4173",
    "endgreen": "30c5,30d5,30d5,30c5",
    "endgreen_top":"30b6,30b5,30d5,30c5",
    "endgreen_left":"30d4,30d5,30c4,30c5",
    "endgreen_right":"",
    "endgreen_topleft":"30b4,30b5,30c4,30c5",
    "endgreen_topright":"",

    "flower_ground_slope_downright_sharp_base":"4515,4514,452b,452a",
    "flower_ground_slope_downright_sharp_fuzz":"44ee,44ee,4505,4504",
    "flower_ground_slope_downright_sharp_secondbase":"4515,4514,4525,4524",
    "flower_ground_slope_downright_sharp_secondfuzz":"457b,457a,4505,4504",

    "ground4_halffuzz":"44ff,44ff,440d,440c",
    "ground4_fullfuzz":"441b,441a,442b,442a",
    "ground4_between":"441d,441c,442d,442c",
    "ground5_halffuzz": "44ff,44ff,400c,400d",

    "ground3_base": "4455,4454,4465,4463",
    "ground3_belowbase1": "4476,4443,407e,445d",
    "ground3_below_continue": "447f,447d,4073,447d",
    "ground3_rightbase": "4452,40ff,4462,40ff",
    "ground3_topcorner": "40ff,40ff,4442,40ff",

    "ground3_below_continue_overlap_thinlog": "4072,4471,4073,447d",

    "ground2_base": "4054,4055,4063,4065",
    "ground2_fuzz_top": "40ff,40ff,4046,4047",
    "ground2_topcorner": "40ff,40ff,40ff,4042",
    "ground2_left": "40ff,4052,40ff,4062",
    "ground2_belowbase1": "4043,4076,405d,407f",
    "ground2_below_continue": "406d,406e,406d,407f",

    "overlap_ground3_ground1_topfuzz": "447f,447d,4073,4440",
    "overlap_ground2_ground1_topfuzz": "407d,407f,4040,4072",
    "overlap_arrowsignleft_ground1_topfuzz": "1090,1091,4044,1093",
    "overlap_arrowsignright_ground1_topfuzz": "1092,10ee,4046,4047",

    "overlap_arrowsignright_gardentopfuzz": "1092,44ee,41cc,4119",
    "overlap_arrowsignleft_gardentopfuzz": "1090,1091,4116,41cb",

    "ground6_base": "4419,4418,4429,4428",
    "ground6_base_topfuzz": "44ff,44ff,4409,44ff",

    "levelendblock_fill": "30c5,30d5,30d5,30c5",
    "levelendblock_topleft": "3007,30b5,3017,30c5",
    "levelendblock_top": "30b6,30b5,30d5,30c5",
    "levelendblock_left": "30d4,30d5,30c4,30c5",
    "levelendblock_bottomleft": "30d4,30d5,30c4,30c5",

    "groundinset_fill": "4192,4192,415e,4192",

    "groundinsethole_fill": "60ff,60ff,60ff,60ff",

    "breakablerock_fill": "4022,4021,4032,4031",

    "junglemud_thintop": "64ee,64ee,455d,455d",
    "junglemud_onebelow": "416c,416d,417c,417d",
    "junglemud_fill": "4161,4160,4160,4171",

    "junglemud_grass_overhang_leftfuzz": "60ee,4526,60ee,4536",
    "junglemud_grass_overhang_leftfuzz_top": "60ee,60ee,4515,4514",
    "junglemud_grass_overhang_left_visualbase": "4525,4524,4535,4534",
    "junglemud_grass_overhang_left_visualbase_below1": "4517,4544,4527,4554",
    "junglemud_grass_overhang_left_visualbase_below_continue": "4547,4577,4537,4568",

    "junglemud_grass_top_visualbase": "4122,4123,4132,4133",
    "junglemud_grass_top_visualbase_shadow": "4142,4143,4152,4153",

    "junglemud_downleft45_base": "4549,4548,4559,4558",
    "junglemud_downleft45_base_below1": "4569,4568,4579,4578",
    "junglemud_downright45_base": "4148,4149,4158,4159",
    "junglemud_downright45_base_below1": "4168,4169,4178,4179",

    "junglestone_fill": "2034,2834,2834,2434",
    // These are specific to the moss ones, every other matches
    "junglestone_moss_top": "2002,2003,2012,2013",
    "junglestone_moss_topleft": "2000,2001,2010,2011",
    "junglestone_moss_topright": "2004,2005,2014,2015",
    // Generic ones
    "junglestone_top":"2007,2008,2021,2027",
    "junglestone_topleft":"2016,2017,2026,2027",
    "junglestone_left":"2041,2834,2041,2043",
    "junglestone_right":"2021,2025,2034,2035",
    "junglestone_bottom":"2021,2443,2051,2052",
    "junglestone_bottomleft": "2040,2443,2050,2051",
    "junglestone_bottomright": "2044,2045,2054,2055",
    "junglestone_topright":"2017,2018,2027,2028",

    // Cave/ground ceiling
    "ground_ceiling_left":"410a,415a,419a,419b",
    "ground_ceiling_middle":"410c,415a,419c,419b",
    "ground_ceiling_right":"415a,450a,459b,459a",

    // Castle BGs
    "castlebg_topright_dark": "5186,5187,5923,5197",
    "castlebg_fill": "5123,5523,5923,5d23",
    "castlebg_topright_clear": "5166,50ff,5176,5166",
    "castlebg_topleft_clear": "50ff,5165,5165,5175",
    "castlebg_bottomright_clear": "5976,5966,5966,58ff",
    "castlebg_bottomleft_clear": "5d66,5d76,5cff,5d66",

    "castle_fallingdoor_shade": "4122,4122,4122,4122",
    "castle_fallingdoor_blank": "4132,4132,4132,4132",
    "castle_fallingdoor_rightline": "4132,4133,4132,4133",

    "decal_dottedplatform_right_1": "125a,165a,60ff,60ff",
    "decal_dottedplatform_right_2": "125b,125b,60ff,60ff",
    "decal_seesaw_holder_left": "60ee,31f9,41c4,41c5",
    "decal_seesaw_holder_right": "41fa,60ee,41c6,41c7",
    "twisted_tree_trunk_vertical": "119c,119d,119c,119d",
    "twisted_tree_trunk_vertical_ground": "11ac,11ad,11bc,11bd",
    "twisted_tree_trunk_downright_1": "11c6,11c7,10ee,11d6",
    "twisted_tree_trunk_downright_2": "11c8,10ee,11d7,11d8",
    "twisted_tree_trunk_downleft_1": "11e7,11e8,11f8,10ee",
    "twisted_tree_trunk_downleft_2": "10ee,11e6,11f6,11f7",
    "overlap_ground_0xdPlatform": "4072,4471,4073,447d",
    
    "ground_edge_left": "406d,406e,406d,407f",
    "ground_edge_right": "446e,446d,447f,446d",

    "raven_sphere_topleft": "4128,4129,4138,4139",
    "raven_sphere_topright": "412a,412b,413a,413b",
    "raven_sphere_bottomleft": "4148,4149,4158,4159",
    "raven_sphere bottomright": "414a,414b,415a,415b",

    "lineguide_93_1": "152f,152e,14ee,14ee",
    "lineguide_93_2": "152d,14ee,151f,151e",
    "lineguide_93_3": "14ee,152c,14ee,153c",
    "lineguide_92_1": "10ee,112d,111e,111f",
    "lineguide_92_2": "112e,112f,10ee,10ee",
    "lineguide_92_3": "112c,10ee,113c,10ee",
    "lineguide_94_1": "193c,14ee,192c,18ee",
    "lineguide_94_2": "191e,191f,18ee,192d",
    "lineguide_94_3": "18ee,18ee,192e,192f",
    "lineguide_95_1": "1cee,1d3c,1cee,1d2c",
    "lineguide_95_2": "1d1f,1d1e,1d2d,1cee",
    "lineguide_95_3": "1cee,1cee,1d2f,1d2e",
    "lineguide_space": "1cee,1cee,1cee,1cee",
    "lineguide_91": "1cee,1e66,1e57,1e56",
    "lineguide_90": "1a66,1cee,1a56,1a57",
    "lineguide_8e": "1256,1257,1266,1cee",
    "lineguide_8f": "1657,1656,1cee,1666",
    "lineguide_topmost_horizontal": "125e,125e,1cee,1cee",
    "lineguide_leftmost_vertical": "125d,1cee,125d,1cee",
    "lineguide_downright_45": "1676,1cee,1cee,1676",
    "lineguide_downleft_45": "1cee,1276,1276,1cee",
    "lineguide_stopper_down_1": "125d,1cee,1273,1cee",
    "lineguide_stopper_down_2": "18ee,18ee,18ee,1270",
    "lineguide_stopper_right_1": "125e,1277,1cee,1cee",
    "lineguide_stopper_right_2": "18ee,18ee,18ee,1267",
    "lineguide_stopper_left_1": "1277,125e,1cee,1cee",
    "lineguide_stopper_left_2": "18ee,18ee,1267,18ee",

    "tree_trunk_8d": "5197,5198,5197,5198",
    "tree_trunk_8d_root": "51a6,51a7,51a3,51a4",

    "rock_floating_fill": "5123,5122,5133,5132",
    "rock_floating_top": "5102,5103,5112,5112",
    "rock_floating_bottom": "5142,5143,5152,5153",
    "rock_floating_left": "5120,5121,5120,5131",
    "rock_floating_right": "5124,5125,5134,5135",
    "rock_floating_tl": "5100,5101,5110,5111",
    "rock_floating_tr": "5104,5105,5114,5115",
    "rock_floating_bl": "5140,5141,5150,5151",
    "rock_floating_br": "5144,5145,5154,5155",

    "ground_ceiling_downright_shallow_fuzz1": "41ae,41af,40ee,40ee",
    "ground_ceiling_downright_shallow_fuzz2": "41be,406e,41ce,41cf",
    "ground_ceiling_upright_shallow_fuzz1": "407e,45be,45cf,45ce",
    "ground_ceiling_upright_shallow_fuzz2": "45af,45ae,40ee,40ee",

    "WIPE_breakable_rock":"40ee,40ee,40ee,40ee",

    "dotted_platform_flat": "4585,4584,4595,4594",
    "pipe_level_bg_1": "5926,5126,511c,511d",
    "OVERLAP_thin_wooden_platform_below1_ground_2": "4071,4072,405d,4073",
    "wooden_post_spike": "405b,405c,406b,406c"
};