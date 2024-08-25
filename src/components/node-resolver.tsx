import { ArrowUp, ArrowDown, X, ChevronDown, ChevronRight } from "lucide-react"
import { type FC, useContext, useState } from "react"
import { NodesContext, NodesDispatchContext } from "~/context/contexts"
import { NodeActionType, NodeType } from "~/types/enums"
import { Button } from "./shared/button"
import { Card, CardHeader, CardContent } from "./shared/card"
import { Combobox } from "./shared/node-combobox"
import { DEFAULT_NODE_OPTIONS } from "~/constants"
import { CvtColorNodeBody, FolderReaderNodeBody, FolderWriterNodeBody, LevelNodeBody, SharpNodeBody } from "./nodes"
import { Collapsible, CollapsibleContent } from "./shared/collapsible"

const nodeBodyComponents: { [key in NodeType]: FC<{ id: number }> } = {
  level: LevelNodeBody as FC<{ id: number }>,
  folder_reader: FolderReaderNodeBody as FC<{ id: number }>,
  folder_writer: FolderWriterNodeBody as FC<{ id: number }>,
  cvt_color: CvtColorNodeBody as FC<{ id: number }>,
  sharp: SharpNodeBody as FC<{ id: number }>,
}

export function NodeResolver({ id }: { id: number }) {
  const nodes = useContext(NodesContext)
  const data = nodes[id]
  const [isOpen, setIsOpen] = useState(data.collapsed)
  const NodeBodyComponent = nodeBodyComponents[data.name]
  const dispatch = useContext(NodesDispatchContext)
  const onTypeChange = (value: string) => {
    dispatch({
      type: NodeActionType.CHANGE,
      payload: {
        id: data.id,
        name: value as NodeType,
        collapsed: data.collapsed,
        options: DEFAULT_NODE_OPTIONS[value as NodeType],
      },
    })
  }
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="flex flex-row">
          <Combobox initialValue={data.name} allValues={Object.values(NodeType)} onChange={onTypeChange} />
          <Button
            className="ml-3"
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(!isOpen)
              dispatch({
                type: NodeActionType.CHANGE,
                payload: {
                  ...data,
                  collapsed: !isOpen,
                },
              })
            }}
          >
            {isOpen ? <ChevronDown /> : <ChevronRight />}
          </Button>
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
        <CollapsibleContent>
          <CardContent>
            <Card>
              <CardContent className="pt-6">
                <NodeBodyComponent id={id} />
              </CardContent>
            </Card>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
