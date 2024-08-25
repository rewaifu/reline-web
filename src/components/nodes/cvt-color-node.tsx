import { z } from "zod"
import useSetState from "../../hooks/useSetState"
import { useContext } from "react"
import { NodesContext, NodesDispatchContext } from "../../context/contexts"
import { CvtType, NodeActionType } from "~/types/enums"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../shared/select"
import { Label } from "../shared/label"

const cvtColorNodeOptionsSchema = z.object({
  cvt_type: z.nativeEnum(CvtType),
})

type CvtColorNodeOptions = z.infer<typeof cvtColorNodeOptionsSchema>

export function CvtColorNodeBody({ id }: { id: number }) {
  const nodes = useContext(NodesContext)
  const node = nodes[id]
  const [state, setState] = useSetState(node.options as CvtColorNodeOptions)
  const dispatch = useContext(NodesDispatchContext)
  const changeValue = (newOptions: Partial<CvtColorNodeOptions>) => {
    setState(newOptions)
    dispatch({
      type: NodeActionType.CHANGE,
      payload: {
        ...node,
        options: {
          ...state,
          ...newOptions,
        },
      },
    })
  }
  return (
    <div>
      <Label>Cvt Type</Label>
      <Select
        onValueChange={(value) => {
          changeValue({
            cvt_type: value as CvtType,
          })
        }}
        defaultValue={CvtType.RGB2Gray}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.values(CvtType).map((type) => {
              return (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              )
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
