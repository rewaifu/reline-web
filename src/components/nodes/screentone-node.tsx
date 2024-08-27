import { z } from "zod"
import { useContext } from "react"
import { NodesContext, NodesDispatchContext } from "../../context/contexts"
import { NodeActionType } from "~/types/enums.ts"
import { Label } from "../ui/label"
import { Input } from "../ui/input"

const screentoneOptionsSchema = z.object({
  dot_size: z.number(),
})

type ScreentoneNodeOptions = z.infer<typeof screentoneOptionsSchema>

export function ScreentoneNodeBody({ id }: { id: number }) {
  const nodes = useContext(NodesContext)
  const node = nodes[id]
  const options = node.options as ScreentoneNodeOptions
  const dispatch = useContext(NodesDispatchContext)
  const changeValue = (newOptions: Partial<ScreentoneNodeOptions>) => {
    dispatch({
      type: NodeActionType.CHANGE,
      payload: {
        ...node,
        options: {
          ...node.options,
          ...newOptions,
        },
      },
    })
  }
  return (
    <div>
      <div className="flex flex-col gap-2">
        <Label>dot size</Label>
        <Input
          type="number"
          className="w-[180px]"
          step={1}
          value={options.dot_size}
          onChange={(e) => {
            changeValue({
                dot_size: Number.parseInt(e.target.value),
            })
          }}
        />
      </div>
    </div>
  )
}
