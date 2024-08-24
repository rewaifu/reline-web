import { z } from "zod"
import useSetState from "../../hooks/useSetState.ts"
import { useContext } from "react"
import { NodesDispatchContext } from "../../context/contexts.ts"
import { NodeActionType, NodeType, ReaderNodeMode } from "~/types/enums.ts"
import { Input } from "../shared/input.tsx"
import { Checkbox } from "../shared/checkbox.tsx"
import { Label } from "../shared/label.tsx"
import { RadioGroup, RadioGroupItem } from "../shared/radio-group.tsx"

interface FolderReaderNodeBodyProps {
  options: FolderReaderNodeOptions
  id: number
}

const folderReaderOptionsSchema = z.object({
  path: z.string(),
  mode: z.nativeEnum(ReaderNodeMode),
  recursive: z.boolean(),
})

type FolderReaderNodeOptions = z.infer<typeof folderReaderOptionsSchema>

export function FolderReaderNodeBody({ options, id }: FolderReaderNodeBodyProps) {
  const [state, setState] = useSetState(options)
  const dispatch = useContext(NodesDispatchContext)
  const changeValue = (newOptions: Partial<FolderReaderNodeOptions>) => {
    setState(newOptions)
    dispatch({
      type: NodeActionType.CHANGE,
      payload: {
        id,
        name: NodeType.FOLDER_READER,
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
        <Label>Read mode</Label>
        <RadioGroup
          value={state.mode}
          onValueChange={(value: ReaderNodeMode) => {
            changeValue({ mode: value })
          }}
        >
          {Object.values(ReaderNodeMode).map((value) => {
            return (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} />
                <Label>{value}</Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox checked={state.recursive}
          onCheckedChange={(value) => {
            changeValue({ recursive: !!value })
          }}
        />
        <Label>recursive</Label>
      </div>
    </div>
  )
}
