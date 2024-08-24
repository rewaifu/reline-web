import { ArrowUp, ArrowDown, X } from "lucide-react"
import { type FC, useContext } from "react"
import { NodesContext, NodesDispatchContext } from "~/context/contexts"
import { type NodeType, NodeActionType } from "~/types/enums"
import type { GenericNodeOptions, StackNode } from "~/types/node"
import { NodeCombobox } from "./node-combobox"
import { FolderReaderNodeBody } from "./nodes/folder-reader-node"
import { LevelNodeBody } from "./nodes/level-node"
import { Button } from "./shared/button"
import { Card, CardHeader, CardContent } from "./shared/card"

const nodeBodyComponents: { [key in NodeType]: FC<{ options: GenericNodeOptions; id: number }> } = {
  level: LevelNodeBody as FC<{ options: GenericNodeOptions; id: number }>,
  folder_reader: FolderReaderNodeBody as FC<{ options: GenericNodeOptions; id: number }>,
}

export function NodeResolver({ data }: { data: StackNode }) {
  const NodeBodyComponent = nodeBodyComponents[data.name]
  const nodes = useContext(NodesContext)
  const dispatch = useContext(NodesDispatchContext)
  return (
    <Card>
      <CardHeader className="flex flex-row">
        <NodeCombobox name={data.name} id={data.id} />
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
        <NodeBodyComponent options={data.options} id={data.id} />
      </CardContent>
    </Card>
  )
}
