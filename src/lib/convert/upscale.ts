import * as v from "valibot"
import type { ConvertToPureFunction, ConvertToStackFunction } from "~/lib/convert/index"
import { UpscaleOptionsSchema } from "~/types/options"
import { MODEL_POSTFIX, MODEL_PREFIX } from "~/constants"
import { NodeType, PureNodeType } from "~/types/enums"
import { DEFAULT_COLLAPSED } from "~/constants"

// `is_own_model: false` is a UI flag: the model is downloaded by name, so the
// upscale spawns a Download preprocessor and its serialized model points at
// the downloaded file. Two upscales with the same model share one Download
// node (dedupe by name, parents merged in meta).

export const convertUpscaleToPure: ConvertToPureFunction = (nodes, index, preprocess) => {
  const node = nodes[index]
  const { is_own_model, ...rest } = v.parse(UpscaleOptionsSchema, node.options)
  if (is_own_model) {
    return [[{ type: PureNodeType.UPSCALE, options: rest }], index + 1]
  }
  const { model } = rest
  preprocess.push({
    type: PureNodeType.DOWNLOAD,
    options: { name: model },
    meta: node.uid ? { parents: [node.uid] } : undefined,
  })
  return [
    [{ type: PureNodeType.UPSCALE, options: { ...rest, model: `${MODEL_PREFIX}${model}${MODEL_POSTFIX}` } }],
    index + 1,
  ]
}

// Import: the serialized upscale has no `is_own_model` flag — it is derived
// from the preprocess download section (model stripped of its prefix).
const upscaleImportSchema = v.omit(UpscaleOptionsSchema, ["is_own_model"])

export const convertUpscaleToStack: ConvertToStackFunction = (nodes, index, ctx) => {
  const node = nodes[index]
  const options = v.parse(upscaleImportSchema, node.options)
  const stripped = stripModelPrefix(options.model)
  const restored = stripped && ctx.downloadedModels.has(stripped)
    ? { ...options, model: stripped, is_own_model: false }
    : { ...options, is_own_model: true }
  return [
    [
      {
        id: index,
        type: NodeType.UPSCALE,
        options: restored,
        collapsed: DEFAULT_COLLAPSED,
      },
    ],
    index + 1,
  ]
}

const stripModelPrefix = (model: string): string | null => {
  if (!model.startsWith(MODEL_PREFIX) || !model.endsWith(MODEL_POSTFIX)) return null
  return model.slice(MODEL_PREFIX.length, model.length - MODEL_POSTFIX.length)
}
