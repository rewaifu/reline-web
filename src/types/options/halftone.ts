import { z } from "zod"

// todo
export interface PureHalftoneNodeOptions {
  dot_size: number
}

export const screentoneOptionsSchema = z.object({
  dot_size: z.number(),
})

export type ScreentoneNodeOptions = z.infer<typeof screentoneOptionsSchema>


