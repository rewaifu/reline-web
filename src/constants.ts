import { CvtType, type NodeType, ReaderNodeMode, WriterNodeFormat } from "./types/enums"
import type { GenericNodeOptions } from "./types/node"

export const DEFAULT_NODE_OPTIONS: {
  [key in NodeType]: GenericNodeOptions
} = {
  level: {
    low_input: 10,
    high_input: 255,
    low_output: 0,
    high_output: 255,
    gamma: 1,
  },
  folder_reader: {
    path: "content/MyDrive/raws",
    recursive: true,
    mode: ReaderNodeMode.RGB,
  },
  folder_writer: {
    path: "content/MyDrive/raws/output",
    format: WriterNodeFormat.PNG,
  },
  cvt_color: {
    cvt_type: CvtType.RGB2Gray,
  },
  sharp: {
    low_input: 0,
    high_input: 255,
    gamma: 1,
    diapason_white: -1,
    diapason_black: -1,
    canny: false,
  },
}
