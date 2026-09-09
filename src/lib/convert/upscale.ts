import * as v from "valibot";
import type {
  ConvertToPureFunction,
  ConvertToStackFunction,
} from "~/lib/convert/index";
import { UpscaleOptionsSchema } from "~/types/options";
import { MODEL_POSTFIX, MODEL_PREFIX } from "~/constants";
import { NodeType, PureNodeType } from "~/types/enums";
import { DEFAULT_COLLAPSED } from "~/constants";

// `is_own_model: false` is a UI flag: the model was picked from the mdb
// database, so the upscale spawns a Download preprocessor carrying the
// download link; the serialized upscale keeps the bare name (no extension).
// Two upscales with the same model share one Download node (dedupe by name,
// parents merged in meta).

export const convertUpscaleToPure: ConvertToPureFunction = (
  nodes,
  index,
  preprocess
) => {
  const node = nodes[index];
  const { is_own_model, model_url, ...rest } = v.parse(
    UpscaleOptionsSchema,
    node.options
  );
  if (is_own_model || rest.model === "") {
    // own path needs no download; an unpicked model must not spawn a
    // Download preprocessor with an empty name
    return [[{ type: PureNodeType.UPSCALE, options: rest }], index + 1];
  }
  preprocess.push({
    type: PureNodeType.DOWNLOAD,
    options:
      model_url === undefined
        ? { name: rest.model }
        : { name: rest.model, url: model_url },
    meta: node.uid ? { parents: [node.uid] } : undefined,
  });
  return [[{ type: PureNodeType.UPSCALE, options: rest }], index + 1];
};

// Import: the serialized upscale has no `is_own_model` flag — it is derived
// from the preprocess download section. Names may be bare (current format) or
// legacy-prefixed "/content/models/<name>.pth"; both resolve to the bare name.
const upscaleImportSchema = v.omit(UpscaleOptionsSchema, [
  "is_own_model",
  "model_url",
]);

export const convertUpscaleToStack: ConvertToStackFunction = (
  nodes,
  index,
  ctx
) => {
  const node = nodes[index];
  const options = v.parse(upscaleImportSchema, node.options);
  const stripped = stripModelPrefix(options.model);
  const name = stripped ?? options.model;
  if (ctx.downloadedModels.has(name)) {
    const url = ctx.downloadedModels.get(name);
    return [
      [
        {
          id: index,
          type: NodeType.UPSCALE,
          options:
            url === undefined
              ? { ...options, model: name, is_own_model: false }
              : {
                  ...options,
                  model: name,
                  is_own_model: false,
                  model_url: url,
                },
          collapsed: DEFAULT_COLLAPSED,
        },
      ],
      index + 1,
    ];
  }
  return [
    [
      {
        id: index,
        type: NodeType.UPSCALE,
        options: { ...options, is_own_model: true },
        collapsed: DEFAULT_COLLAPSED,
      },
    ],
    index + 1,
  ];
};

const stripModelPrefix = (model: string): string | null => {
  if (!model.startsWith(MODEL_PREFIX) || !model.endsWith(MODEL_POSTFIX))
    return null;
  return model.slice(MODEL_PREFIX.length, model.length - MODEL_POSTFIX.length);
};
