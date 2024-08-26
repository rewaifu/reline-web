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

export enum WriterNodeFormat {
  PNG = "png",
  JPEG = "jpeg",
}

export enum NodeType {
  LEVEL = "level",
  FOLDER_READER = "folder_reader",
  FOLDER_WRITER = "folder_writer",
  SHARP = "sharp",
  CVT_COLOR = "cvt_color",
  UPSCALE = 'upscale'
}

export enum CvtType {
  RGB2Gray = "RGB2Gray",
  RGB2Gray709 = "RGB2Gray709",
  RGB2Gray2020 = "RGB2Gray2020",
  Gray2RGB = "Gray2RGB",
}
