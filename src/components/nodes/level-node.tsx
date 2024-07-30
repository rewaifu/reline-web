import { z } from "zod"
import useSetState from "../../hooks/useSetState.ts"

interface LevelNodeBodyProps {
  initialValue?: LevelNodeOptions
}

export function LevelNodeBody({ initialValue = defaultLevelNodeOptions }: LevelNodeBodyProps) {
  const [state, setState] = useSetState(initialValue)

  return (
    <>
      <input type="number" value={state.low_input} onChange={(e) => setState({ low_input: Number.parseInt(e.target.value) })} />
    </>
  )
}

const levelNodeOptionsSchema = z.object({
  low_input: z.number().min(0).max(255),
  high_input: z.number().min(0).max(255),
  low_output: z.optional(z.number().min(0).max(255)),
  high_output: z.optional(z.number().min(0).max(255)),
  gamma: z.optional(z.number().min(0).max(0)),
})

type LevelNodeOptions = z.infer<typeof levelNodeOptionsSchema>

const defaultLevelNodeOptions: z.infer<typeof levelNodeOptionsSchema> = {
  low_input: 0,
  high_input: 255,
  low_output: 0,
  high_output: 255,
  gamma: 1,
}
