import { z } from "zod"
import useSetState from "../../hooks/useSetState"
import { useContext } from "react"
import { NodesContext, NodesDispatchContext } from "../../context/contexts"
import { NodeActionType, ReaderNodeMode } from "~/types/enums"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const folderReaderOptionsSchema = z.object({
  path: z.string(),
  mode: z.nativeEnum(ReaderNodeMode),
  recursive: z.boolean(),
})

type FolderReaderNodeOptions = z.infer<typeof folderReaderOptionsSchema>

export function FolderReaderNodeBody({ id }: { id: number }) {
  const nodes = useContext(NodesContext)
  const node = nodes[id]
  const [state, setState] = useSetState(node.options as FolderReaderNodeOptions)
  const dispatch = useContext(NodesDispatchContext)
  const changeValue = (newOptions: Partial<FolderReaderNodeOptions>) => {
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
      <div className="flex flex-col space-y-2">
      <Label>Mode</Label>
        <Select
          onValueChange={(value) => {
            changeValue({
              mode: value as ReaderNodeMode,
            })
          }}
          value={state.mode}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.values(ReaderNodeMode).map((mode) => {
                return (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={state.recursive}
          onCheckedChange={(value) => {
            changeValue({ recursive: !!value })
          }}
        />
        <Label>recursive</Label>
      </div>
    </div>
  )
}
