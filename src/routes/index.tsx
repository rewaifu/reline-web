import { type ReactNode, type FC, useReducer } from "react"
import { LevelNodeBody } from "../components/nodes/level-node.tsx"
import { NodesContext, NodesDispatchContext } from "../contexts.ts"
import type { GenericNodeOptions, StackNode } from "../types/node"
import { type NodesAction, NodesActionType } from "../types/actions"
import { Card, CardHeader, CardContent } from "~/components/ui/card.tsx"

const nodeBodyComponents: { [key: string]: FC<{ options: GenericNodeOptions; id: number; name: string }> } = {
  level: LevelNodeBody as FC<{ options: GenericNodeOptions; id: number; name: string }>,
}

function NodeResolver({ data }: { data: StackNode }) {
  const NodeBodyComponent = nodeBodyComponents[data.name]

  return (
    <Card>
      <CardHeader>{data.name}</CardHeader>
      <CardContent>
        <NodeBodyComponent options={data.options} id={data.id} name={data.name} />
      </CardContent>
    </Card>
  )
}

// todo: we're need global state for store nodes
const nodesData: StackNode[] = [{ id: 0, name: "level", options: { low_input: 10 } }]

const nodesReducer = (state: StackNode[], action: NodesAction) => {
  const { type, payload } = action
  switch (type) {
    case NodesActionType.CHANGE:
      return state.map((node) => (node.id === payload.id ? payload : node))
    default:
      return state
  }
}

export default function HomePage() {
  const [nodes, dispatch] = useReducer(nodesReducer, nodesData)

  return (
    <main className="p-5 grid grid-cols-2 gap-x-5">
      <NodesContext.Provider value={nodes}>
        <NodesDispatchContext.Provider value={dispatch}>
          <div>
            {nodes.map((data, index) => (
              <NodeResolver key={`${data.name}_${index}`} data={data} />
            ))}
          </div>
          <Card>
            <CardHeader>Code</CardHeader>
            <CardContent>
              <textarea className="w-full" value={JSON.stringify(nodes)} />
            </CardContent>
          </Card>
        </NodesDispatchContext.Provider>
      </NodesContext.Provider>
    </main>
  )
}
