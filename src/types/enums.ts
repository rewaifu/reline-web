export enum NodeActionType {
  ADD = "ADD",
  DELETE = "DELETE",
  CHANGE = "CHANGE",
  MOVEUP = "MOVEUP",
  MOVEDOWN = "MOVEDOWN",
}

export enum ReaderNodeMode {
  RGB = "rgb",
  GRAY = "gray",
  DYNAMIC = "dynamic",
}

export enum NodeType {
  LEVEL = "level",
  FOLDER_READER = "folder_reader",
  CVT_COLOR = "cvt_color",
}

export enum CvtType {
  RGB2Gray = "RGB2Gray",
  RGB2Gray709 = "RGB2Gray709",
  RGB2Gray2020 = "RGB2Gray2020",
  Gray2RGB = "Gray2RGB",
}
