import * as v from "valibot";
import { DType, TilerType } from "~/types/enums";

export const UpscaleOptionsSchema = v.object({
  model: v.string(),
  /** false = the model is downloaded by name (spawns a Download preprocessor). */
  is_own_model: v.boolean(),
  dtype: v.picklist(Object.values(DType)),
  tiler: v.picklist(Object.values(TilerType)),
  exact_tiler_size: v.number(),
  allow_cpu_upscale: v.boolean(),
  target_scale: v.optional(v.number()),
  /** mdb download link of the picked model; UI-only, exported into the
   * Download preprocessor. Cleared whenever the model name is retyped. */
  model_url: v.optional(v.string()),
});

export type UpscaleNodeOptions = v.InferOutput<typeof UpscaleOptionsSchema>;

/** Serialized upscale has no UI flags; the model is the bare name. */
export type PureUpscaleNodeOptions = Omit<
  UpscaleNodeOptions,
  "is_own_model" | "model_url"
>;
