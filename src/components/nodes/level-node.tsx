import { z } from "zod"
import useSetState from "../../hooks/useSetState.ts"
import { useContext } from "react"
import { NodesDispatchContext } from "../../context/contexts.ts"
import { NumberInput } from "../shared/number-input.tsx"
import { NodeActionType, NodeType } from "~/types/enums.ts"

interface LevelNodeBodyProps {
  options: LevelNodeOptions
  id: number
}

const levelNodeOptionsSchema = z.object({
  low_input: z.number().min(0).max(255),
  high_input: z.number().min(0).max(255),
  low_output: z.number(z.number().min(0).max(255)),
  high_output: z.number(z.number().min(0).max(255)),
  gamma: z.number(z.number().min(0).max(10)),
})

type LevelNodeOptions = z.infer<typeof levelNodeOptionsSchema>

export function LevelNodeBody({ options, id }: LevelNodeBodyProps) {
  const [state, setState] = useSetState(options)
  const dispatch = useContext(NodesDispatchContext)
  const changeValue = (newOptions: Partial<LevelNodeOptions>) => {
    setState(newOptions)
    dispatch({
      type: NodeActionType.CHANGE,
      payload: {
        id,
        name: NodeType.LEVEL,
        options: {
          ...state,
          ...newOptions,
        },
      },
    })
  }
  return (
    <div>
      <NumberInput
        min={0}
        max={255}
        step={1}
        labelText="In White"
        value={state.low_input}
        onChange={(value) => {
          changeValue({ low_input: Math.trunc(value) })
        }}
      />
      <NumberInput
        min={0}
        max={255}
        step={1}
        labelText="In Black"
        value={state.high_input}
        onChange={(value) => {
          changeValue({ high_input: Math.trunc(value) })
        }}
      />
      <NumberInput
        min={0}
        max={255}
        step={1}
        labelText="Out White"
        value={state.low_output}
        onChange={(value) => {
          changeValue({ low_output: Math.trunc(value) })
        }}
      />
      <NumberInput
        min={0}
        max={255}
        step={1}
        labelText="Out Black"
        value={state.high_output}
        onChange={(value) => {
          changeValue({ high_output: Math.trunc(value) })
        }}
      />
      <NumberInput
        min={0}
        max={10}
        step={0.1}
        labelText="Gamma"
        value={state.gamma}
        onChange={(value) => {
          changeValue({ gamma: value })
        }}
      />
    </div>
  )
}
