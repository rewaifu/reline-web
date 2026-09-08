import type { NodeType, PureNodeType } from "./enums"
import type {
  PureCvtColorNodeOptions,
  PureFolderReaderNodeOptions,
  PureFolderWriterNodeOptions,
  PureHalftoneNodeOptions,
  PureLevelNodeOptions,
  PureResizeOptions,
  PureSharpNodeOptions,
  PureUpscaleNodeOptions,
} from "~/types/options"

import type {
  CvtColorNodeOptions,
  FolderReaderNodeOptions,
  FolderWriterNodeOptions,
  ScreentoneNodeOptions,
  LevelNodeOptions,
  ResizeNodeOptions,
  SharpNodeOptions,
  UpscaleNodeOptions,
} from "~/types/options"

export type NodeOptions =
  | CvtColorNodeOptions
  | FolderReaderNodeOptions
  | FolderWriterNodeOptions
  | ScreentoneNodeOptions
  | LevelNodeOptions
  | ResizeNodeOptions
  | SharpNodeOptions
  | UpscaleNodeOptions

/** Options of the generated preprocessors (download / unarchive). */
export type PureDownloadNodeOptions = { name: string }
export type PureUnarchiveNodeOptions = { path: string }

export type PureNodeOptions =
  | PureCvtColorNodeOptions
  | PureFolderReaderNodeOptions
  | PureFolderWriterNodeOptions
  | PureHalftoneNodeOptions
  | PureLevelNodeOptions
  | PureResizeOptions
  | PureSharpNodeOptions
  | PureDownloadNodeOptions
  | PureUpscaleNodeOptions
  | PureUnarchiveNodeOptions

export interface PureNode {
  type: PureNodeType
  options: PureNodeOptions
  /**
   * UI-only metadata carried in the shared config under `meta`, so it never
   * mixes with pipeline data. The API ignores it.
   */
  meta?: { name?: string; disabled?: boolean; parents?: string[] }
}

/** Serialized config shape: main pipeline plus its preprocessors section. */
export interface PureConfig {
  nodes: PureNode[]
  preprocess: PureNode[]
}

export interface StackNode {
  id: number
  type: NodeType
  options: NodeOptions
  /** UI-only display name, ignored by backend serialization */
  name?: string
  collapsed: boolean
  /**
   * UI-only stable identity for FLIP reorder animations. Unlike `id` (which
   * is reindexed to array positions on MOVE), this never changes, so the
   * DOM element can be matched to its pre-move position.
   */
  uid?: string
  enabled?: boolean
}