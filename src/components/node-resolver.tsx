import { ArrowUp, ArrowDown, X } from "lucide-react"
import { type FC, useContext } from "react"
import { NodesContext, NodesDispatchContext } from "~/context/contexts"
import { NodeActionType, NodeType } from "~/types/enums"
import type { GenericNodeOptions, StackNode } from "~/types/node"
import { FolderReaderNodeBody } from "./nodes/folder-reader-node"
import { LevelNodeBody } from "./nodes/level-node"
import { Button } from "./shared/button"
import { Card, CardHeader, CardContent } from "./shared/card"
import { Combobox } from "./shared/node-combobox"
import { CvtColorNodeBody } from "./nodes/cvt-color-node"
import { DEFAULT_NODE_OPTIONS } from "~/constants"

const nodeBodyComponents: { [key in NodeType]: FC<{ options: GenericNodeOptions; id: number }> } = {
  level: LevelNodeBody as FC<{ options: GenericNodeOptions; id: number }>,
  folder_reader: FolderReaderNodeBody as FC<{ options: GenericNodeOptions; id: number }>,
  cvt_color: CvtColorNodeBody as FC<{ options: GenericNodeOptions; id: number }>,
}

export function NodeResolver({ data }: { data: StackNode }) {
  const NodeBodyComponent = nodeBodyComponents[data.name]
  const nodes = useContext(NodesContext)
  const dispatch = useContext(NodesDispatchContext)
  const onTypeChange = (value: string) => {
    dispatch({
      type: NodeActionType.CHANGE,
      payload: {
        id: data.id,
        name: value as NodeType,
        options: DEFAULT_NODE_OPTIONS[value as NodeType]
      },
    })
  }
  return (
    <Card>
      <CardHeader className="flex flex-row">
        <Combobox initialValue={data.name} allValues={Object.values(NodeType)} onChange={onTypeChange} />
        <Button
          variant="ghost"
          size="icon"
          disabled={data.id === 0}
          className="ml-auto"
          onClick={() => {
            dispatch({
              type: NodeActionType.MOVEUP,
              payload: data,
            })
          }}
        >
          <ArrowUp />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={data.id === nodes.length - 1}
          onClick={() => {
            dispatch({
              type: NodeActionType.MOVEDOWN,
              payload: data,
            })
          }}
        >
          <ArrowDown />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            dispatch({
              type: NodeActionType.DELETE,
              payload: data,
            })
          }}
        >
          <X />
        </Button>
      </CardHeader>
      <CardContent>
        <Card>
          <CardContent className="pt-6">
            <NodeBodyComponent options={data.options} id={data.id} />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
