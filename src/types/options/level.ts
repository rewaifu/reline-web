import * as v from "valibot"

export interface PureLevelNodeOptions {
  low_input: number
  high_input: number
  low_output: number
  high_output: number
  gamma: number
}

export const levelNodeOptionsSchema = v.object({
  low_input: v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
  high_input: v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
  low_output: v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
  high_output: v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
  gamma: v.pipe(v.number(), v.minValue(0), v.maxValue(10)),
})

export type LevelNodeOptions = v.InferOutput<typeof levelNodeOptionsSchema>
