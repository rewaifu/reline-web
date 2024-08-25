import { z } from "zod"
import useSetState from "../../hooks/useSetState.ts"
import { useContext } from "react"
import { NodesDispatchContext } from "../../context/contexts.ts"
import { NodeActionType, NodeType, WriterNodeFormat } from "~/types/enums.ts"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../shared/select.tsx"
import { Input } from "../shared/input.tsx"
import { Label } from "../shared/label.tsx"

interface FolderWriterNodeBodyProps {
  options: FolderWriterNodeOptions
  id: number
}

const folderWriterOptionsSchema = z.object({
  path: z.string(),
  format: z.nativeEnum(WriterNodeFormat),
})

type FolderWriterNodeOptions = z.infer<typeof folderWriterOptionsSchema>

export function FolderWriterNodeBody({ options, id }: FolderWriterNodeBodyProps) {
  const [state, setState] = useSetState(options)
  const dispatch = useContext(NodesDispatchContext)
  const changeValue = (newOptions: Partial<FolderWriterNodeOptions>) => {
    setState(newOptions)
    dispatch({
      type: NodeActionType.CHANGE,
      payload: {
        id,
        name: NodeType.FOLDER_WRITER,
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
        defaultValue={WriterNodeFormat.PNG}
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
