import { z } from "zod"
import useSetState from "../../hooks/useSetState.ts"
import { useContext } from "react"
import { NodesDispatchContext } from "../../contexts.ts"
import { NodesActionType } from "../../types/actions"

interface LevelNodeBodyProps {
  options: LevelNodeOptions
  id: number
  name: string
}

export function LevelNodeBody({ options = defaultLevelNodeOptions, id, name }: LevelNodeBodyProps) {
  const [state, setState] = useSetState(options)
  const dispatch = useContext(NodesDispatchContext)
  return (
    <>
      <input
        type="number"
        value={state.low_input}
        onChange={(e) => {
          setState({ low_input: Number.parseInt(e.target.value) })
          dispatch({
            type: NodesActionType.CHANGE,
            payload: { id, name, options: { ...state, low_input: Number.parseInt(e.target.value) } },
          })
        }}
      />
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

const defaultLevelNodeOptions: LevelNodeOptions = {
  low_input: 0,
  high_input: 255,
  low_output: 0,
  high_output: 255,
  gamma: 1,
}
