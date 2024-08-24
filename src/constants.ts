import { ReaderNodeMode } from "./types/enums"

export const DEFAULT_NODE_OPTIONS = {
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
}
