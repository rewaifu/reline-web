import { CannyType, CvtType, NodeType, ReaderNodeMode, ResizeFilterType, ResizeType, TilerType, WriterNodeFormat } from "./types/enums"
import type { NodeOptions, StackNode } from "./types/node"

export const DEFAULT_COLLAPSED = true
export const MODELS_URL = "https://mdb.yor.ovh/v1/files"

export const MODELS = [
  "1_DWTP_ds_span_p",
  "1x-fast-jpeg-illust-v1",
  "1x_Bendel_Halftone",

  "1x-MangaJPEGHQ",
  "1x-MangaJPEGHQPlus",
  "1x-MangaJPEGLQ",
  "1x_MangaJPEGMQ",

  "1x_Saiyajin_DeJPEG_300000_G",
  "1x_eula_digimanga_bw_v3_nc1_52k",
  "2x_WTP_MCover_cugan",
  "2x_umzi_Mahou_cugan",
  "4DWTP_mangasoup_cugan_p",
  "4x-AnimeSharp",
  "4x-UltraMix_Balanced",
  "4x-UltraMix_Restore",
  "4x-UltraMix_Smooth",
  "4xRealWebPhoto_v3_atd",
  "4x_DWTP_DS_ATDl",
  "4x_DWTP_DS_ATDl2",
  "4x_DWTP_DS_DAT2_V3",
  "4x_DWTP_DS_dat2_v3_2",
  "4x_DWTP_dehesragan_V4",
  "4x_DWTP_descreenon_dat2",

  "4x_MangaJaNai_1200p_V1RC71_ESRGAN_70k",
  "4x_MangaJaNai_1300p_V1RC1_ESRGAN_75k",
  "4x_MangaJaNai_1400p_V1RC3_ESRGAN_105k",
  "4x_MangaJaNai_1500p_V1RC1_ESRGAN_105k",
  "4x_MangaJaNai_1600p_V1RC1_ESRGAN_70k",
  "4x_MangaJaNai_1920p_V1RC1_ESRGAN_105k",
  "4x_MangaJaNai_2048p_V1RC1_ESRGAN_70k",
  "4x_MangaJaNai_V1RC34_ESRGAN_760k",

  "4x_dwtp_ds_atdl3",
  "4x_dwtp_ds_rgts_v1",
  "4x_eula_digimanga_MiA_65k",
  "4x_eula_digimanga_bw_v2_nc1_307k",
  "4x_span_franken",
  "4x_umzi_dehalfton_realplksr_v1",
  "4x_umzi_digital_art_rplksr_v1",
  "4x_umzi_digital_art_span_v1",
  "4x_umzi_digital_art_mosr",
  "4x_wtp_ms_atdl_v1",
  "4x_wtp_ms_beta_atdl",
  "4x_wtp_ms_plksr_v1",
  "4x_wtp_ms_rplksr_beta",
  "4x_dwtp_ds_rplksr_delta",
  "4x_umzi_digital_art_rplksr_v2",
  "4x_MangaScale_v1_mosr",
  "4x_umzi_decompress_mosr",
]

export const DEFAULT_MODEL = "4x_dwtp_ds_atdl3"
export const MODEL_PREFIX = "/content/models/"
export const MODEL_POSTFIX = ".pth"
export const STORAGE_KEY = "nodes-data"

export const DEFAULT_TILE_SIZE = 800
export const DEFAULT_SPREAD_SIZE = 2800

export const DEFAULT_RESIZE_WIDTH = 2000
export const DEFAULT_RESIZE_HEIGHT = 3200
export const DEFAULT_RESIZE_PERCENT = 50

export const DEFAULT_CANNY_TYPE = CannyType.NORMAL

export const DEFAULT_NODE_OPTIONS: {
  [key in NodeType]: NodeOptions
} = {
  level: {
    low_input: 0,
    high_input: 253,
    low_output: 0,
    high_output: 255,
    gamma: 1,
  },
  folder_reader: {
    path: "/content/drive/MyDrive/raws",
    recursive: true,
    mode: ReaderNodeMode.DYNAMIC,
    unarchive: false,
  },
  folder_writer: {
    path: "/content/drive/MyDrive/raws/output",
    format: WriterNodeFormat.PNG,
  },
  cvt_color: {
    cvt_type: CvtType.RGB2Gray,
  },
  sharp: {
    low_input: 3,
    high_input: 250,
    gamma: 1,
    diapason_white: 2,
    diapason_black: -1,
    canny: true,
    canny_type: DEFAULT_CANNY_TYPE,
  },
  upscale: {
    is_own_model: false,
    model: DEFAULT_MODEL,
    tiler: TilerType.EXACT,
    exact_tiler_size: DEFAULT_TILE_SIZE,
    allow_cpu_upscale: false,
  },
  resize: {
    resize_type: ResizeType.BY_WIDTH,
    width: DEFAULT_RESIZE_WIDTH,
    filter: ResizeFilterType.CUBIC_MITCHELL,
    spread: true,
    spread_size: DEFAULT_SPREAD_SIZE,
    gamma_correction: false,
  },
  screentone: {
    dot_size: 7,
  },
}

export const DEFAULT_NODES: StackNode[] = [
  { id: 0, type: NodeType.FOLDER_READER, options: DEFAULT_NODE_OPTIONS.folder_reader, collapsed: true },
  { id: 1, type: NodeType.UPSCALE, options: DEFAULT_NODE_OPTIONS.upscale, collapsed: true },
  { id: 2, type: NodeType.SHARP, options: DEFAULT_NODE_OPTIONS.sharp, collapsed: true },
  { id: 3, type: NodeType.SCREENTONE, options: DEFAULT_NODE_OPTIONS.screentone, collapsed: true },
  { id: 4, type: NodeType.RESIZE, options: DEFAULT_NODE_OPTIONS.resize, collapsed: true },
  { id: 5, type: NodeType.LEVEL, options: DEFAULT_NODE_OPTIONS.level, collapsed: true },
  { id: 6, type: NodeType.FOLDER_WRITER, options: DEFAULT_NODE_OPTIONS.folder_writer, collapsed: true },
]
