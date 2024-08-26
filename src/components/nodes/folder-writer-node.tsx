import { z } from "zod"
import useSetState from "../../hooks/useSetState"
import { useContext } from "react"
import { NodesContext, NodesDispatchContext } from "../../context/contexts"
import { NodeActionType, WriterNodeFormat } from "~/types/enums.ts"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

const folderWriterOptionsSchema = z.object({
  path: z.string(),
  format: z.nativeEnum(WriterNodeFormat),
})

type FolderWriterNodeOptions = z.infer<typeof folderWriterOptionsSchema>

export function FolderWriterNodeBody({ id }: { id: number }) {
  const nodes = useContext(NodesContext)
  const node = nodes[id]
  const [state, setState] = useSetState(node.options as FolderWriterNodeOptions)
  const dispatch = useContext(NodesDispatchContext)
  const changeValue = (newOptions: Partial<FolderWriterNodeOptions>) => {
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
    <div className="flex flex-col gap-5">
      <div>
        <Label>Path to folder</Label>
        <Input
          placeholder="Path/to/folder"
          value={state.path}
          onChange={(e) => {
            changeValue({ path: e.target.value })
          }}
        />
      </div>
      <div>
        <Label>Format</Label>
        <Select
          onValueChange={(value) => {
            changeValue({
              format: value as WriterNodeFormat,
            })
          }}
          value={state.format}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.values(WriterNodeFormat).map((type) => {
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
    </div>
  )
}
