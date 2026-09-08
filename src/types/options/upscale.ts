import * as v from "valibot"
import { DType, TilerType } from "~/types/enums"

export const UpscaleOptionsSchema = v.object({
  model: v.string(),
  /** false = the model is downloaded by name (spawns a Download preprocessor). */
  is_own_model: v.boolean(),
  dtype: v.picklist(Object.values(DType)),
  tiler: v.picklist(Object.values(TilerType)),
  exact_tiler_size: v.number(),
  allow_cpu_upscale: v.boolean(),
  target_scale: v.optional(v.number()),
})

export type UpscaleNodeOptions = v.InferOutput<typeof UpscaleOptionsSchema>

/** Serialized upscale has no UI flag; the model path points at the downloaded file. */
export type PureUpscaleNodeOptions = Omit<UpscaleNodeOptions, "is_own_model">
