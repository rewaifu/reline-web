import * as v from "valibot"
import {DotType, HalftoneMode, FilterType} from "~/types/enums"

// todo
export interface PureHalftoneNodeOptions {
  dot_size: number | number[]
  angle: number | number[]
  dot_type: DotType | DotType[]
  halftone_mode: HalftoneMode
}

export const screentoneOptionsSchema = v.object({
  halftone_mode: v.picklist(Object.values(HalftoneMode)),
  dot_size: v.union([v.number(), v.array(v.number())]),
  angle: v.union([v.number(), v.array(v.number())]),
  dot_type: v.union([v.picklist(Object.values(DotType)), v.array(v.picklist(Object.values(DotType)))]),
  ssaa_scale: v.optional(v.number()),
  ssaa_filter: v.optional(v.picklist(Object.values(FilterType))),
  disable_auto_dot: v.optional(v.boolean()),
})

export type ScreentoneNodeOptions = v.InferOutput<typeof screentoneOptionsSchema>
