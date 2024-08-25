import { Card, CardHeader, CardContent } from "./shared/card"
import { useContext } from "react"
import { NodesContext, NodesDispatchContext } from "~/context/contexts"
import { Button } from "./shared/button"
import { DEFAULT_NODE_OPTIONS } from "~/constants"
import { NodeActionType, NodeType } from "~/types/enums"
import { NodeResolver } from "./node-resolver"

export function NodesSection() {
  const nodes = useContext(NodesContext)
  const dispatch = useContext(NodesDispatchContext)
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div>Nodes</div>
        <Button
          variant="secondary"
          className="ml-auto"
          onClick={() => {
            dispatch({
              type: NodeActionType.ADD,
              payload: {
                id: nodes.length,
                name: NodeType.LEVEL,
                options: DEFAULT_NODE_OPTIONS.level,
                collapsed: false,
              },
            })
          }}
        >
          Add Node
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {nodes.map((data, index) => (
          <NodeResolver key={`${data.name}_${index}`} id={data.id} />
        ))}
      </CardContent>
    </Card>
  )
}
