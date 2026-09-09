import { NodeType, PureNodeType } from "~/types/enums";
import type {
  NodeOptions,
  PureConfig,
  PureNode,
  PureNodeOptions,
  StackNode,
} from "~/types/node";
import { MODEL_POSTFIX, MODEL_PREFIX } from "~/constants";
import {
  convertHalftoneToStack,
  convertScreentoneToPure,
} from "~/lib/convert/halftone";
import {
  convertResizeToPure,
  convertResizeToStack,
} from "~/lib/convert/resize";
import {
  convertUpscaleToPure,
  convertUpscaleToStack,
} from "~/lib/convert/upscale";
import { DEFAULT_COLLAPSED } from "~/constants";
import {
  convertFolderReaderToPure,
  convertFolderReaderToStack,
} from "~/lib/convert/folder-reader";

export type ConvertToPureFunction = (
  nodes: StackNode[],
  index: number,
  preprocess: PureNode[]
) => [PureNode[], number];

/** Import context: models downloaded by the preprocess section (name →
 * mdb url, undefined for legacy downloads that carry no link). */
export interface StackImportContext {
  downloadedModels: ReadonlyMap<string, string | undefined>;
  unarchivedPaths: ReadonlySet<string>;
}

export type ConvertToStackFunction = (
  nodes: PureNode[],
  index: number,
  ctx: StackImportContext
) => [StackNode[], number];

const convertEqualsToPure: ConvertToPureFunction = (nodes, index) => {
  const node = nodes[index];
  const result = {
    type: node.type as unknown as PureNodeType,
    options: node.options as PureNodeOptions,
  };
  return [[result], index + 1];
};

const convertEqualsToStack: ConvertToStackFunction = (nodes, index) => {
  const node = nodes[index];
  const result = {
    id: index,
    type: node.type as unknown as NodeType,
    options: node.options as NodeOptions,
    collapsed: DEFAULT_COLLAPSED,
  };
  return [[result], index + 1];
};

const convertToPureMapper: Record<NodeType, ConvertToPureFunction> = {
  [NodeType.UPSCALE]: convertUpscaleToPure,
  [NodeType.RESIZE]: convertResizeToPure,
  [NodeType.SCREENTONE]: convertScreentoneToPure,
  [NodeType.CVT_COLOR]: convertEqualsToPure,
  [NodeType.FOLDER_READER]: convertFolderReaderToPure,
  [NodeType.FOLDER_WRITER]: convertEqualsToPure,
  [NodeType.LEVEL]: convertEqualsToPure,
  [NodeType.SHARP]: convertEqualsToPure,
};

const convertToStackMapper: Partial<
  Record<PureNodeType, ConvertToStackFunction>
> = {
  [PureNodeType.UPSCALE]: convertUpscaleToStack,
  [PureNodeType.RESIZE]: convertResizeToStack,
  [PureNodeType.HALFTONE]: convertHalftoneToStack,
  [PureNodeType.CVT_COLOR]: convertEqualsToStack,
  [PureNodeType.FOLDER_READER]: convertFolderReaderToStack,
  [PureNodeType.FOLDER_WRITER]: convertEqualsToStack,
  [PureNodeType.LEVEL]: convertEqualsToStack,
  [PureNodeType.SHARP]: convertEqualsToStack,
};

export const convertToPure = (nodes: StackNode[]): PureConfig => {
  const config: PureNode[] = [];
  const preprocess: PureNode[] = [];
  for (let i = 0; i < nodes.length; ) {
    const [converted, nextIndex] = convertToPureMapper[nodes[i].type](
      nodes,
      i,
      preprocess
    );
    // keep UI-only state on the head pure node of the group (API ignores it)
    const pureNode = nodes[i];
    if (converted[0]) {
      const meta: PureNode["meta"] = {};
      if (pureNode.name) meta.name = pureNode.name;
      if (pureNode.enabled === false) meta.disabled = true;
      if (meta.name !== undefined || meta.disabled) converted[0].meta = meta;
    }
    config.push(...converted);
    i = nextIndex;
  }
  return { nodes: config, preprocess: dedupeDownloads(preprocess) };
};

/**
 * Preprocessors are shared: several parents referencing the same download
 * (by model name) collapse into one node, their owner uids merged in meta.
 */
const dedupeDownloads = (preprocess: PureNode[]): PureNode[] => {
  const byName = new Map<string, PureNode>();
  const rest: PureNode[] = [];
  for (const node of preprocess) {
    if (node.type !== PureNodeType.DOWNLOAD || !("name" in node.options)) {
      rest.push(node);
      continue;
    }
    const existing = byName.get(node.options.name);
    if (!existing) {
      byName.set(node.options.name, node);
      continue;
    }
    // merge owners: both parents reference this single preprocessor
    const parents = new Set([
      ...(existing.meta?.parents ?? []),
      ...(node.meta?.parents ?? []),
    ]);
    existing.meta = { ...existing.meta, parents: [...parents] };
  }
  return [...byName.values(), ...rest];
};

/** Preprocessors are UI-implicit: on import they dissolve back into flags. */
const importContext = (
  preprocess: PureNode[] | undefined
): StackImportContext => {
  const downloadedModels = new Map<string, string | undefined>();
  const unarchivedPaths = new Set<string>();
  for (const node of preprocess ?? []) {
    if (node.type === PureNodeType.DOWNLOAD && "name" in node.options) {
      downloadedModels.set(node.options.name, node.options.url);
    }
    if (node.type === PureNodeType.UNARCHIVE && "path" in node.options) {
      // strip the ".zip" the reader appended on export
      unarchivedPaths.add(node.options.path.replace(/\.zip$/, ""));
    }
  }
  return { downloadedModels, unarchivedPaths };
};

const convertPureList = (
  nodes: PureNode[],
  ctx: StackImportContext
): StackNode[] => {
  const result: StackNode[] = [];
  for (let i = 0; i < nodes.length; ) {
    // preprocess nodes dissolve into parent flags, they never become stack nodes
    const converter = convertToStackMapper[nodes[i].type];
    if (!converter) {
      i += 1;
      continue;
    }
    const [converted, nextIndex] = converter(nodes, i, ctx);
    const stackSource = nodes[i];
    if (converted[0]) {
      if (stackSource.meta?.name) converted[0].name = stackSource.meta.name;
      if (stackSource.meta?.disabled) converted[0].enabled = false;
    }
    result.push(...converted);
    i = nextIndex;
  }
  return result.map((node, index) => ({ ...node, id: index }));
};

export const convertToStack = (pure: PureConfig | PureNode[]): StackNode[] => {
  if (Array.isArray(pure)) {
    // legacy flat configs have no preprocess section: nothing is downloaded/unarchived implicitly
    return convertPureList(pure, {
      downloadedModels: new Map(),
      unarchivedPaths: new Set(),
    });
  }
  return convertPureList(pure.nodes ?? [], importContext(pure.preprocess));
};
