import { z } from "zod"
import { TilerType } from "~/types/enums.ts"

export interface PureUpscaleNodeOptions {
  model: string
  tiler: TilerType
  exact_tiler_size: number
  allow_cpu_upscale: boolean
}
export interface PureDownloadNodeOptions {
  name: string
}

export const upscaleOptionsSchema = z.object({
  is_own_model: z.boolean(),
  model: z.string(),
  tiler: z.nativeEnum(TilerType),
  exact_tiler_size: z.number(),
  allow_cpu_upscale: z.boolean(),
})

export type UpscaleNodeOptions = z.infer<typeof upscaleOptionsSchema>
