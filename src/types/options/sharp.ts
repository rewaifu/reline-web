import { z } from "zod"

export interface PureSharpNodeOptions {
  low_input: number
  high_input: number
  gamma: number
  diapason_white: number
  diapason_black: number
  canny: boolean
}

export const sharpNodeOptionsSchema = z.object({
  low_input: z.number().min(0).max(255),
  high_input: z.number().min(0).max(255),
  gamma: z.number(z.number().min(0).max(10)),
  diapason_white: z.number(z.number().min(0).max(255)),
  diapason_black: z.number(z.number().min(0).max(255)),
  canny: z.boolean(),
})

export type SharpNodeOptions = z.infer<typeof sharpNodeOptionsSchema>
