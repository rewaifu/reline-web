import type { NodeOptions } from "~/types/node";
import { NodeType, ReaderNodeMode } from "~/types/enums";
import { DEFAULT_NODE_OPTIONS } from "~/constants";

export type FieldKind = "text" | "number" | "select" | "checkbox";

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  items?: readonly string[];
}

export interface NodeDef {
  type: NodeType;
  label: string;
  description: string;
  fields: readonly FieldDef[];
  defaults: NodeOptions;
}

export const NODE_DEFS: Record<NodeType, NodeDef> = {
  [NodeType.FOLDER_READER]: {
    type: NodeType.FOLDER_READER,
    label: "Folder Reader",
    description:
      "Reads images from a folder as the pipeline input. Supports recursive scan and grayscale mode.",
    fields: [
      { key: "path", label: "Path to folder", kind: "text" },
      { key: "mode", label: "Mode", kind: "select", items: ["rgb", "gray"] },
      { key: "recursive", label: "Recursive", kind: "checkbox" },
    ],
    defaults: {
      path: "",
      mode: "rgb" as ReaderNodeMode,
      recursive: false,
    } as NodeOptions,
  },
  [NodeType.FOLDER_WRITER]: {
    type: NodeType.FOLDER_WRITER,
    label: "Folder Writer",
    description:
      "Writes processed images to a folder. Choose output format: png or jpeg.",
    fields: [
      { key: "path", label: "Path to folder", kind: "text" },
      {
        key: "format",
        label: "Format",
        kind: "select",
        items: ["png", "jpeg"],
      },
    ],
    defaults: { path: "", format: "png" } as NodeOptions,
  },
  [NodeType.UPSCALE]: {
    type: NodeType.UPSCALE,
    label: "Upscale",
    description:
      "Runs an upscaling model from a local path. Picks dtype, tiling and optional target scale. Add a Download node to fetch the model first.",
    fields: [
      { key: "model", label: "Model path", kind: "text" },
      {
        key: "dtype",
        label: "DType",
        kind: "select",
        items: ["F32", "F16", "BF16"],
      },
      {
        key: "tiler",
        label: "Tiler",
        kind: "select",
        items: ["exact", "no_tiling"],
      },
      { key: "exact_tiler_size", label: "Exact tiler size", kind: "number" },
      {
        key: "allow_cpu_upscale",
        label: "Allow CPU upscale",
        kind: "checkbox",
      },
      { key: "target_scale", label: "Target scale", kind: "number" },
    ],
    defaults: {
      model: "",
      // false = model is downloaded by name (spawns a Download preprocessor);
      // required by UpscaleOptionsSchema — the code panel parses on every edit
      is_own_model: false,
      dtype: "F32",
      tiler: "exact",
      exact_tiler_size: 800,
      allow_cpu_upscale: false,
    } as NodeOptions,
  },
  [NodeType.RESIZE]: {
    type: NodeType.RESIZE,
    label: "Resize",
    description:
      "Resizes images by width, height, absolute size or percent, with a choice of interpolation filter and optional spread.",
    fields: [
      {
        key: "resize_type",
        label: "Resize type",
        kind: "select",
        items: ["width", "height", "absolute", "percent"],
      },
      { key: "width", label: "Width", kind: "number" },
      { key: "height", label: "Height", kind: "number" },
      { key: "percent", label: "Percent", kind: "number" },
      {
        key: "filter",
        label: "Filter",
        kind: "select",
        items: [
          "nearest",
          "box",
          "linear",
          "hamming",
          "catmullrom",
          "mitchell",
          "lanczos",
          "gauss",
        ],
      },
      { key: "spread", label: "Spread", kind: "checkbox" },
      { key: "spread_size", label: "Spread size", kind: "number" },
    ],
    defaults: {
      resize_type: "width",
      width: 1920,
      filter: "lanczos",
      spread: false,
    } as NodeOptions,
  },
  [NodeType.SHARP]: {
    type: NodeType.SHARP,
    label: "Sharp",
    description:
      "Applies levels-based sharpening with optional canny edge handling (normal, invert, unsharp).",
    fields: [
      { key: "low_input", label: "Low input", kind: "number" },
      { key: "high_input", label: "High input", kind: "number" },
      { key: "gamma", label: "Gamma", kind: "number" },
      { key: "diapason_white", label: "Diapason white", kind: "number" },
      { key: "diapason_black", label: "Diapason black", kind: "number" },
      { key: "canny", label: "Canny", kind: "checkbox" },
      {
        key: "canny_type",
        label: "Canny type",
        kind: "select",
        items: ["normal", "invert", "unsharp"],
      },
    ],
    defaults: {
      low_input: 2,
      high_input: 253,
      gamma: 1,
      diapason_white: 2,
      diapason_black: -1,
      canny: true,
      canny_type: "normal",
    } as NodeOptions,
  },
  [NodeType.LEVEL]: {
    type: NodeType.LEVEL,
    label: "Level",
    description:
      "Remaps tonal range: input/output levels and gamma correction.",
    fields: [
      { key: "low_input", label: "Low input", kind: "number" },
      { key: "high_input", label: "High input", kind: "number" },
      { key: "low_output", label: "Low output", kind: "number" },
      { key: "high_output", label: "High output", kind: "number" },
      { key: "gamma", label: "Gamma", kind: "number" },
    ],
    defaults: {
      low_input: 0,
      high_input: 255,
      low_output: 0,
      high_output: 255,
      gamma: 1,
    } as NodeOptions,
  },
  [NodeType.CVT_COLOR]: {
    type: NodeType.CVT_COLOR,
    label: "Cvt Color",
    description:
      "Converts color space, e.g. RGB to grayscale (BT.609/2020) or back.",
    fields: [
      {
        key: "cvt_type",
        label: "Conversion",
        kind: "select",
        items: ["RGB2Gray", "RGB2Gray709", "RGB2Gray2020", "Gray2RGB"],
      },
    ],
    defaults: { cvt_type: "RGB2Gray" } as NodeOptions,
  },
  [NodeType.SCREENTONE]: {
    type: NodeType.SCREENTONE,
    label: "Screentone",
    description:
      "Generates or removes halftone screentone (dot size, angle, dot type, optional SSAA).",
    fields: [
      {
        key: "halftone_mode",
        label: "Mode",
        kind: "select",
        items: ["gray", "rgb", "hsv", "cmyk"],
      },
      { key: "dot_size", label: "Dot size", kind: "number" },
      { key: "angle", label: "Angle", kind: "number" },
      {
        key: "dot_type",
        label: "Dot type",
        kind: "select",
        items: ["circle", "line", "cross", "ellipse", "invline"],
      },
      { key: "disable_auto_dot", label: "Disable auto dot", kind: "checkbox" },
    ],
    defaults: {
      halftone_mode: "gray",
      dot_size: 6,
      angle: 45,
      dot_type: "circle",
    } as NodeOptions,
  },
};
export const NODE_ORDER: readonly NodeType[] = Object.values(NodeType);
